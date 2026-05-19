import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';
import { PERMISSIONS } from '../lib/permissions.js';
import { generateQrCodeDataUrl } from '../lib/qr.js';
import { generateDocument, type PdfDocType } from '../lib/pdf.js';
import type { SystemFamily, DistributionType } from '@prisma/client';

export const productionPackRoutes = new Hono();

const MFG_STATUS_ORDER = [
  'BOOKING_PRODUCTION', 'AWAITING_SMOKE_ALARMS', 'FABRICATION', 'ASSEMBLY', 'QC', 'DISPATCH',
];

async function generatePackRef(): Promise<string> {
  const count = await prisma.productionPack.count();
  return `PP-${String(count + 1).padStart(3, '0')}`;
}

async function generateMfgRef(): Promise<string> {
  const count = await prisma.manufacturingJob.count();
  return `MFG-${String(count + 1).padStart(3, '0')}`;
}

function formatSystem(s: any) {
  return {
    id: s.id, packId: s.packId, systemIndex: s.systemIndex,
    family: s.family, variant: s.variant,
    widthMm: s.widthMm, heightMm: s.heightMm,
    customerSupplied: s.customerSupplied, addManual: s.addManual, addWarrantyCard: s.addWarrantyCard,
    notes: s.notes, cuttingList: s.cuttingList, accessories: s.accessories,
    qrCodeUrl: s.qrCodeUrl, createdAt: s.createdAt, updatedAt: s.updatedAt,
  };
}

function formatPack(p: any) {
  return {
    id: p.id, packRef: p.packRef, liveProjectId: p.liveProjectId, liveServiceId: p.liveServiceId,
    status: p.status, distributionType: p.distributionType,
    sentToStage5At: p.sentToStage5At,
    systems: (p.systems ?? []).map(formatSystem),
    createdAt: p.createdAt, updatedAt: p.updatedAt,
  };
}

// List packs (by project or service)
productionPackRoutes.get('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { liveProjectId, liveServiceId } = c.req.query();
  const where: any = {};
  if (liveProjectId) where.liveProjectId = liveProjectId;
  if (liveServiceId) where.liveServiceId = liveServiceId;
  const packs = await prisma.productionPack.findMany({
    where, include: { systems: { orderBy: { systemIndex: 'asc' } } }, orderBy: { createdAt: 'desc' },
  });
  return c.json(packs.map(formatPack));
});

productionPackRoutes.post('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const packRef = await generatePackRef();
  const pack = await prisma.productionPack.create({
    data: { packRef, liveProjectId: body.liveProjectId, liveServiceId: body.liveServiceId },
    include: { systems: true },
  });
  return c.json(formatPack(pack), 201);
});

productionPackRoutes.get('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const pack = await prisma.productionPack.findUnique({
    where: { id: c.req.param('id') },
    include: { systems: { orderBy: { systemIndex: 'asc' } } },
  });
  if (!pack) return c.json({ error: 'Not found' }, 404);
  return c.json(formatPack(pack));
});

productionPackRoutes.patch('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const data: any = {};
  if ('distributionType' in body) data.distributionType = body.distributionType as DistributionType;
  if ('status' in body) data.status = body.status;
  const pack = await prisma.productionPack.update({
    where: { id: c.req.param('id') }, data,
    include: { systems: { orderBy: { systemIndex: 'asc' } } },
  });
  return c.json(formatPack(pack));
});

// Systems
productionPackRoutes.post('/:id/systems', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const pack = await prisma.productionPack.findUnique({ where: { id: c.req.param('id') }, include: { systems: true } });
  if (!pack) return c.json({ error: 'Not found' }, 404);
  const nextIndex = pack.systems.length + 1;
  const system = await prisma.productionSystem.create({
    data: {
      packId: c.req.param('id'),
      systemIndex: nextIndex,
      family: body.family as SystemFamily,
      variant: body.variant,
      widthMm: body.widthMm ? Number(body.widthMm) : null,
      heightMm: body.heightMm ? Number(body.heightMm) : null,
      notes: body.notes,
    },
  });
  return c.json(formatSystem(system), 201);
});

productionPackRoutes.patch('/:id/systems/:systemId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const intFields = ['widthMm', 'heightMm'];
  const data: any = {};
  for (const [key, val] of Object.entries(body)) {
    if (intFields.includes(key)) data[key] = val != null ? Number(val) : null;
    else data[key] = val;
  }

  // Recompute cutting list when dimensions or variant change
  if (data.widthMm || data.heightMm || data.variant || data.family) {
    const existing = await prisma.productionSystem.findUnique({ where: { id: c.req.param('systemId') } });
    const width = data.widthMm ?? existing?.widthMm ?? 0;
    const height = data.heightMm ?? existing?.heightMm ?? 0;
    const variant = data.variant ?? existing?.variant ?? '';
    data.cuttingList = computeCuttingList(width, height, variant);
  }

  const system = await prisma.productionSystem.update({
    where: { id: c.req.param('systemId') }, data,
  });

  // Generate QR code if not present
  if (!system.qrCodeUrl) {
    try {
      const url = `${process.env.APP_URL ?? 'https://app.firecurtains.local'}/systems/${system.id}`;
      const qrDataUrl = await generateQrCodeDataUrl(url);
      await prisma.productionSystem.update({ where: { id: system.id }, data: { qrCodeUrl: qrDataUrl } });
    } catch { /* non-critical */ }
  }

  return c.json(formatSystem(system));
});

productionPackRoutes.delete('/:id/systems/:systemId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  await prisma.productionSystem.delete({ where: { id: c.req.param('systemId') } });
  return c.json({ ok: true });
});

// T-097/T-112: Production pack PDF downloads
const PACK_PDF_TYPES: Record<string, PdfDocType> = {
  'cutting-list': 'PRODUCTION_CUTTING_LIST',
  'spec-sheet': 'PRODUCTION_SPEC_SHEET',
  'qc-form': 'QC_FORM',
  'packing-list': 'PACKING_LIST',
  'labels': 'LABELS',
  'box-labels': 'BOX_LABELS',
};

productionPackRoutes.get('/:id/systems/:systemId/pdf/:docType', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { docType } = c.req.param();
  const pdfType = PACK_PDF_TYPES[docType];
  if (!pdfType) return c.json({ error: 'Unknown document type' }, 400);

  const system = await prisma.productionSystem.findUnique({ where: { id: c.req.param('systemId') } });
  if (!system) return c.json({ error: 'Not found' }, 404);

  const cuttingList = (system.cuttingList as any[]) ?? [];
  const data: Record<string, unknown> = {
    'Pack Ref': c.req.param('id'),
    'System Index': system.systemIndex,
    'Family': system.family,
    'Variant': system.variant,
    'Width (mm)': system.widthMm ?? '—',
    'Height (mm)': system.heightMm ?? '—',
  };
  if (docType === 'cutting-list' && cuttingList.length > 0) {
    cuttingList.forEach((item: any) => { data[item.component] = item.dimension; });
  }

  const buffer = await generateDocument(pdfType, data);
  c.header('Content-Type', 'application/pdf');
  c.header('Content-Disposition', `attachment; filename="${docType}-SYS${system.systemIndex}.pdf"`);
  return c.body(buffer as any);
});

// Send to Stage 5A — creates manufacturing job (T-099, T-101)
productionPackRoutes.post('/:id/send-to-stage5', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const pack = await prisma.productionPack.findUnique({
    where: { id: c.req.param('id') }, include: { systems: true, mfgJob: true },
  });
  if (!pack) return c.json({ error: 'Not found' }, 404);
  if (pack.mfgJob) return c.json({ error: 'Already sent to manufacturing', mfgJobId: pack.mfgJob.id }, 400);
  if (pack.systems.length === 0) return c.json({ error: 'No systems configured' }, 400);

  // T-102: Stage 4 gate — all systems must have family, variant, and dimensions
  const incompleteSystems = pack.systems.filter(s => !s.family || !s.variant || !s.widthMm || !s.heightMm);
  if (incompleteSystems.length > 0) {
    return c.json({
      error: 'Stage 4 gate not met',
      details: `Systems ${incompleteSystems.map(s => s.systemIndex).join(', ')} are missing family, variant, or dimensions`,
    }, 400);
  }

  const mfgRef = await generateMfgRef();
  const mfgJob = await prisma.manufacturingJob.create({
    data: {
      mfgRef,
      source: pack.liveServiceId ? 'LS' : 'LG',
      packId: pack.id,
      liveProjectId: pack.liveProjectId,
      liveServiceId: pack.liveServiceId,
      // Auto-seed QC checkpoints from standard list
      qcCheckpoints: {
        create: [
          { label: 'Body dimensions correct' },
          { label: 'Cassette profile fitted' },
          { label: 'Motor installed and tested' },
          { label: 'Fabric wound and aligned' },
          { label: 'Control panel wired' },
          { label: 'Labels attached' },
          { label: 'QC sign-off form completed' },
        ],
      },
      // Seed fabric rows from system cutting lists
      fabricRows: {
        create: pack.systems.map(s => ({
          systemRef: `SYS-${s.systemIndex}`,
          widthMm: s.widthMm,
          dropMm: s.heightMm,
          material: s.variant ?? '',
          quantity: 1,
        })),
      },
    },
    include: { qcCheckpoints: true, fabricRows: true, components: true },
  });

  await prisma.productionPack.update({
    where: { id: pack.id },
    data: { status: 'STAGE5', sentToStage5At: new Date() },
  });

  return c.json(formatMfgJob(mfgJob), 201);
});

// Manufacturing jobs
export const manufacturingRoutes = new Hono();

function formatMfgJob(j: any) {
  return {
    id: j.id, mfgRef: j.mfgRef, source: j.source, status: j.status,
    packId: j.packId, liveProjectId: j.liveProjectId, liveServiceId: j.liveServiceId,
    customerName: j.customerName, siteName: j.siteName, description: j.description,
    priority: j.priority, requiredByDate: j.requiredByDate,
    engineerName: j.engineerName,
    specNotes: j.specNotes, specRequiredBy: j.specRequiredBy, specPriority: j.specPriority,
    approvedBy: j.approvedBy, authorisedBy: j.authorisedBy,
    allComponentsDone: j.allComponentsDone, qcFormsUploaded: j.qcFormsUploaded,
    stampChecked: j.stampChecked, productionDocsDone: j.productionDocsDone,
    components: j.components ?? [],
    fabricRows: j.fabricRows ?? [],
    qcCheckpoints: j.qcCheckpoints ?? [],
    createdAt: j.createdAt, updatedAt: j.updatedAt,
  };
}

manufacturingRoutes.get('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const jobs = await prisma.manufacturingJob.findMany({
    include: { components: true, fabricRows: true, qcCheckpoints: true },
    orderBy: { createdAt: 'desc' },
  });
  return c.json(jobs.map(formatMfgJob));
});

manufacturingRoutes.get('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const job = await prisma.manufacturingJob.findUnique({
    where: { id: c.req.param('id') },
    include: { components: true, fabricRows: true, qcCheckpoints: true },
  });
  if (!job) return c.json({ error: 'Not found' }, 404);
  return c.json(formatMfgJob(job));
});

manufacturingRoutes.patch('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const data: any = {};
  const dateFields = ['requiredByDate', 'specRequiredBy'];
  for (const [key, val] of Object.entries(body)) {
    if (dateFields.includes(key)) data[key] = val ? new Date(val as string) : null;
    else data[key] = val;
  }
  const job = await prisma.manufacturingJob.update({
    where: { id: c.req.param('id') }, data,
    include: { components: true, fabricRows: true, qcCheckpoints: true },
  });
  return c.json(formatMfgJob(job));
});

// Advance status — forward only
manufacturingRoutes.post('/:id/advance-status', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { targetStatus } = await c.req.json();
  const job = await prisma.manufacturingJob.findUnique({
    where: { id: c.req.param('id') },
    include: { pack: true },
  });
  if (!job) return c.json({ error: 'Not found' }, 404);
  const currentIdx = MFG_STATUS_ORDER.indexOf(job.status);
  const targetIdx = MFG_STATUS_ORDER.indexOf(targetStatus);
  if (targetIdx <= currentIdx) return c.json({ error: 'Can only advance forward' }, 400);

  // T-111: Stage 5 explicit dependencies — require allComponentsDone before leaving BOOKING_PRODUCTION
  if (job.status === 'BOOKING_PRODUCTION' && !job.allComponentsDone) {
    return c.json({ error: 'Stage 5 gate not met', details: 'All components must be marked done before advancing past booking' }, 400);
  }

  // T-142: Stage 6 explicit dependencies — gate DISPATCH transition
  if (targetStatus === 'DISPATCH') {
    const fullJob = await prisma.manufacturingJob.findUnique({
      where: { id: c.req.param('id') },
      include: { qcCheckpoints: true, pack: true },
    });
    const unmetConditions: string[] = [];
    const allQcDone = fullJob?.qcCheckpoints?.every(cp => cp.checked) ?? false;
    if (!allQcDone) unmetConditions.push('All QC checkpoints must be checked');
    if (!fullJob?.allComponentsDone) unmetConditions.push('All components must be marked done');
    if (!fullJob?.qcFormsUploaded) unmetConditions.push('QC forms must be uploaded');
    if (!fullJob?.pack?.distributionType) unmetConditions.push('Distribution type must be selected on the production pack');
    if (unmetConditions.length > 0) {
      return c.json({ error: 'Stage 6 conditions not met', unmetConditions }, 400);
    }
  }

  const updated = await prisma.manufacturingJob.update({
    where: { id: c.req.param('id') }, data: { status: targetStatus },
    include: { components: true, fabricRows: true, qcCheckpoints: true },
  });

  // T-121: MFG complete (DISPATCH) → auto-create DistributionJob with correct type
  if (targetStatus === 'DISPATCH' && !await prisma.distributionJob.findFirst({ where: { mfgJobId: job.id } })) {
    const distType: DistributionType = job.pack?.distributionType ?? 'COLLECTION';
    const djCount = await prisma.distributionJob.count();
    const djRef = `DJ-${String(djCount + 1).padStart(3, '0')}`;
    await prisma.distributionJob.create({
      data: {
        djRef,
        distributionType: distType,
        mfgJobId: job.id,
        liveProjectId: job.liveProjectId ?? undefined,
        liveServiceId: job.liveServiceId ?? undefined,
        customerName: job.customerName ?? undefined,
        siteName: job.siteName ?? undefined,
      },
    });
  }

  return c.json(formatMfgJob(updated));
});

// QC checkpoints
manufacturingRoutes.patch('/:id/qc-checkpoints/:checkpointId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { checked } = await c.req.json();
  await prisma.mfgQcCheckpoint.update({ where: { id: c.req.param('checkpointId') }, data: { checked } });
  const job = await prisma.manufacturingJob.findUnique({
    where: { id: c.req.param('id') },
    include: { components: true, fabricRows: true, qcCheckpoints: true },
  });
  return c.json(formatMfgJob(job));
});

// Components
manufacturingRoutes.post('/:id/components', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const comp = await prisma.mfgComponent.create({
    data: {
      jobId: c.req.param('id'),
      name: body.name,
      category: body.category,
      status: body.status ?? 'AWAITING_STOCK_OUT',
      requiredByDate: body.requiredByDate ? new Date(body.requiredByDate) : null,
      quantity: body.quantity ?? 1,
    },
  });
  return c.json(comp, 201);
});

manufacturingRoutes.patch('/:id/components/:componentId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const data: any = {};
  if ('status' in body) data.status = body.status;
  if ('requiredByDate' in body) data.requiredByDate = body.requiredByDate ? new Date(body.requiredByDate) : null;
  if ('quantity' in body) data.quantity = Number(body.quantity);
  const comp = await prisma.mfgComponent.update({ where: { id: c.req.param('componentId') }, data });
  return c.json(comp);
});

// Compute cutting list from dimensions + variant
function computeCuttingList(widthMm: number, heightMm: number, variant: string): any[] {
  const w = widthMm;
  const h = heightMm;
  if (!w || !h) return [];

  // Base formula set — variant modifies offsets
  const variantOffset = variant?.includes('DC80-40') ? 40 : variant?.includes('DC80-25') ? 25 : 10;
  return [
    { component: 'Body', dimension: `${w - variantOffset} × ${h}` },
    { component: 'Cassette', dimension: `${w + 20}mm` },
    { component: 'Leg / Cassette Profile', dimension: `${h}mm` },
    { component: 'Bottom Rail', dimension: `${w - 4}mm` },
    { component: 'Drive Shaft', dimension: `${w - variantOffset}mm` },
    { component: 'Fabric', dimension: `${w - 6}mm × ${h + 200}mm` },
    { component: 'Threshold Plate', dimension: `${w}mm` },
    { component: 'Bracket Set', dimension: '2 off' },
    { component: 'Top Bearing', dimension: '1 off' },
    { component: 'End Cap', dimension: '2 off' },
    { component: 'Cord', dimension: `${h * 2 + 500}mm` },
    { component: 'Chain', dimension: `${h + 300}mm` },
  ];
}
