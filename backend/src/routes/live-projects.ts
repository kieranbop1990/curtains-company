import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';
import { PERMISSIONS } from '../lib/permissions.js';
import { logStageTransition } from '../lib/audit.js';
import { getXeroAccessToken, getInvoiceStatus } from '../lib/xero.js';
import { sendEmail } from '../lib/email.js';
import type { DrawingStatus, ReviewStatus, LQRoutingDecision } from '@prisma/client';

export const liveProjectsRoutes = new Hono();

async function generateLqRef(): Promise<string> {
  const count = await prisma.liveProject.count();
  return `LQ-${String(count + 1).padStart(3, '0')}`;
}

function formatLiveProject(lp: any) {
  return {
    id: lp.id,
    lqRef: lp.lqRef,
    stage: lp.stage,
    sourceQuoteId: lp.sourceQuoteId,
    customerName: lp.customerName,
    customerEmail: lp.customerEmail ?? '',
    customerPhone: lp.customerPhone ?? '',
    siteAddress: lp.siteAddress ?? '',
    siteType: lp.siteType ?? '',
    supplyType: lp.supplyType ?? '',
    productType: lp.productType ?? '',
    widthMm: lp.widthMm ?? null,
    heightMm: lp.heightMm ?? null,
    totalContractValue: lp.totalContractValue ?? null,
    paidToDate: lp.paidToDate ?? null,
    vatAmount: lp.vatAmount ?? null,
    paymentTerms: lp.paymentTerms ?? '',
    surveyDate: lp.surveyDate ?? null,
    drawingsDue: lp.drawingsDue ?? null,
    drawingsApprovedDate: lp.drawingsApprovedDate ?? null,
    installationBooked: lp.installationBooked ?? null,
    expectedCompletion: lp.expectedCompletion ?? null,
    poReceived: lp.poReceived,
    drawingsReceived: lp.drawingsReceived,
    depositPaid: lp.depositPaid,
    surveyBooked: lp.surveyBooked,
    contractApproved: lp.contractApproved,
    signatureData: lp.signatureData ?? null,
    surveyCompletionDate: lp.surveyCompletionDate ?? null,
    surveyStatus: lp.surveyStatus ?? '',
    surveyorName: lp.surveyorName ?? '',
    surveyMethod: lp.surveyMethod ?? '',
    surveyAccessType: lp.surveyAccessType ?? '',
    surveySignedOff: lp.surveySignedOff,
    reviewApprovalDate: lp.reviewApprovalDate ?? null,
    reviewComments: lp.reviewComments ?? '',
    reviewStatus: lp.reviewStatus,
    routingDecision: lp.routingDecision ?? null,
    assigneeId: lp.assigneeId ?? '',
    assigneeName: lp.assigneeName ?? '',
    invoices: (lp.invoices ?? []).map((i: any) => ({
      id: i.id, invoiceNumber: i.invoiceNumber, status: i.status,
      amount: i.amount, dueDate: i.dueDate ?? null, xeroInvoiceId: i.xeroInvoiceId ?? null,
    })),
    drawings: (lp.drawings ?? []).map((d: any) => ({
      id: d.id, drawingNumber: d.drawingNumber, description: d.description ?? '',
      status: d.status,
    })),
    installationSchedule: (lp.installationSchedule ?? []).map((item: any) => ({
      id: item.id, systemName: item.systemName,
      installationDate: item.installationDate ?? null, commissionDate: item.commissionDate ?? null,
      amount: item.amount ?? null, paid: item.paid,
    })),
    components: (lp.components ?? []).map((c: any) => ({
      id: c.id, componentName: c.componentName, qty: c.qty,
      stockStatus: c.stockStatus, cost: c.cost ?? null,
    })),
    createdAt: lp.createdAt,
    updatedAt: lp.updatedAt,
  };
}

const withRelations = {
  invoices: { orderBy: { createdAt: 'asc' as const } },
  drawings: { orderBy: { createdAt: 'asc' as const } },
  installationSchedule: { orderBy: { createdAt: 'asc' as const } },
  components: { orderBy: { createdAt: 'asc' as const } },
};

// List
liveProjectsRoutes.get('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { stage, search } = c.req.query();
  const where: any = {};
  if (stage) where.stage = stage;
  if (search) where.OR = [
    { lqRef: { contains: search, mode: 'insensitive' } },
    { customerName: { contains: search, mode: 'insensitive' } },
  ];
  const lps = await prisma.liveProject.findMany({ where, include: withRelations, orderBy: { createdAt: 'desc' } });
  return c.json(lps.map(formatLiveProject));
});

// Get single
liveProjectsRoutes.get('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const lp = await prisma.liveProject.findUnique({ where: { id: c.req.param('id') }, include: withRelations });
  if (!lp) return c.json({ error: 'Not found' }, 404);
  return c.json(formatLiveProject(lp));
});

// Create (from quote conversion)
liveProjectsRoutes.post('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const lqRef = await generateLqRef();

  let sourceData: any = {};
  if (body.sourceQuoteId) {
    const q = await prisma.quote.findUnique({ where: { id: body.sourceQuoteId } });
    if (q) {
      sourceData = {
        customerName: q.customerName,
        customerEmail: q.customerEmail,
        customerPhone: q.customerPhone,
        siteAddress: q.siteAddress,
        siteType: q.siteType,
        supplyType: q.supplyType,
        productType: q.productType,
        widthMm: q.widthMm,
        heightMm: q.heightMm,
        totalContractValue: q.orderValue,
      };
    }
  }

  const lp = await prisma.liveProject.create({
    data: { lqRef, sourceQuoteId: body.sourceQuoteId, ...sourceData, ...body },
    include: withRelations,
  });

  if (body.sourceQuoteId) {
    const auth = c.get('user' as any);
    await logStageTransition({
      recordId: lp.id, recordType: 'LiveProject',
      actorId: auth?.sub ?? 'system', actorName: auth?.name ?? 'system',
      fromStage: 'QUOTE', toStage: 'LQ', method: 'NORMAL',
    });
  }

  return c.json(formatLiveProject(lp), 201);
});

// Update
liveProjectsRoutes.patch('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const dateFields = ['surveyDate', 'drawingsDue', 'drawingsApprovedDate', 'installationBooked',
    'expectedCompletion', 'surveyCompletionDate', 'reviewApprovalDate'];
  const floatFields = ['totalContractValue', 'paidToDate', 'vatAmount'];
  const intFields = ['widthMm', 'heightMm'];
  const data: any = {};
  for (const [key, val] of Object.entries(body)) {
    if (dateFields.includes(key)) data[key] = val ? new Date(val as string) : null;
    else if (floatFields.includes(key)) data[key] = val != null ? Number(val) : null;
    else if (intFields.includes(key)) data[key] = val != null ? Number(val) : null;
    else data[key] = val;
  }
  const lp = await prisma.liveProject.update({ where: { id: c.req.param('id') }, data, include: withRelations });
  return c.json(formatLiveProject(lp));
});

// Stage transition: LQ → SD
liveProjectsRoutes.post('/:id/advance-to-stage3', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const id = c.req.param('id');
  const auth = c.get('user' as any);
  const lp = await prisma.liveProject.update({ where: { id }, data: { stage: 'SD' }, include: withRelations });
  await logStageTransition({
    recordId: id, recordType: 'LiveProject',
    actorId: auth?.sub ?? 'system', actorName: auth?.name ?? 'system',
    fromStage: 'LQ', toStage: 'SD', method: 'NORMAL',
  });
  return c.json(formatLiveProject(lp));
});

// Routing decision: 4A or 4B
liveProjectsRoutes.post('/:id/route', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const id = c.req.param('id');
  const { decision } = await c.req.json() as { decision: LQRoutingDecision };
  if (!['PRODUCTION_PACK', 'LIVE_SERVICES'].includes(decision)) {
    return c.json({ error: 'Invalid routing decision' }, 400);
  }
  const auth = c.get('user' as any);
  const lp = await prisma.liveProject.update({
    where: { id }, data: { routingDecision: decision }, include: withRelations,
  });
  await logStageTransition({
    recordId: id, recordType: 'LiveProject',
    actorId: auth?.sub ?? 'system', actorName: auth?.name ?? 'system',
    fromStage: 'SD', toStage: decision, method: 'NORMAL',
  });
  return c.json(formatLiveProject(lp));
});

// Invoices
liveProjectsRoutes.post('/:id/invoices', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const inv = await prisma.lQInvoice.create({
    data: {
      liveProjectId: c.req.param('id'),
      invoiceNumber: body.invoiceNumber,
      amount: Number(body.amount),
      status: body.status ?? 'PENDING',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  });
  return c.json(inv, 201);
});

liveProjectsRoutes.patch('/:id/invoices/:invId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const inv = await prisma.lQInvoice.update({
    where: { id: c.req.param('invId') },
    data: {
      status: body.status,
      amount: body.amount != null ? Number(body.amount) : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      xeroInvoiceId: body.xeroInvoiceId,
    },
  });
  return c.json(inv);
});

liveProjectsRoutes.delete('/:id/invoices/:invId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  await prisma.lQInvoice.delete({ where: { id: c.req.param('invId') } });
  return c.json({ ok: true });
});

// Xero sync for invoices
liveProjectsRoutes.post('/:id/invoices/xero-sync', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const invoices = await prisma.lQInvoice.findMany({ where: { liveProjectId: c.req.param('id'), xeroInvoiceId: { not: null } } });
  const results: any[] = [];
  for (const inv of invoices) {
    try {
      const xeroData = await getInvoiceStatus(inv.xeroInvoiceId!);
      const isPaid = xeroData.status === 'PAID';
      const isOverdue = !isPaid && inv.dueDate != null && new Date(inv.dueDate) < new Date();
      const newStatus = isPaid ? 'PAID' : isOverdue ? 'OVERDUE' : 'PENDING';
      const updated = await prisma.lQInvoice.update({
        where: { id: inv.id },
        data: { status: newStatus as any },
      });
      // T-146: Overdue invoice alert to Finance
      if (isOverdue) {
        try {
          await sendEmail(
            process.env.FINANCE_EMAIL ?? 'finance@example.com',
            `Overdue Invoice — ${inv.xeroInvoiceId}`,
            `<p>Invoice <strong>${inv.xeroInvoiceId}</strong> is overdue (due: ${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB') : 'N/A'}).</p><p>Amount: £${inv.amount?.toFixed(2) ?? '—'}</p>`,
          );
        } catch { /* non-fatal */ }
      }
      results.push({ id: inv.id, synced: true, status: updated.status });
    } catch (e: any) {
      results.push({ id: inv.id, synced: false, error: e.message });
    }
  }
  return c.json({ results });
});

// Drawings
liveProjectsRoutes.post('/:id/drawings', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const d = await prisma.lQDrawing.create({
    data: {
      liveProjectId: c.req.param('id'),
      drawingNumber: body.drawingNumber,
      description: body.description,
      status: body.status ?? 'ISSUED',
    },
  });
  return c.json(d, 201);
});

liveProjectsRoutes.patch('/:id/drawings/:drawingId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const d = await prisma.lQDrawing.update({
    where: { id: c.req.param('drawingId') },
    data: { status: body.status as DrawingStatus, description: body.description, drawingNumber: body.drawingNumber },
  });
  return c.json(d);
});

liveProjectsRoutes.delete('/:id/drawings/:drawingId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  await prisma.lQDrawing.delete({ where: { id: c.req.param('drawingId') } });
  return c.json({ ok: true });
});

// Installation schedule
liveProjectsRoutes.post('/:id/installation-items', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const item = await prisma.lQInstallationItem.create({
    data: {
      liveProjectId: c.req.param('id'),
      systemName: body.systemName,
      installationDate: body.installationDate ? new Date(body.installationDate) : null,
      commissionDate: body.commissionDate ? new Date(body.commissionDate) : null,
      amount: body.amount != null ? Number(body.amount) : null,
      paid: body.paid ?? false,
    },
  });
  return c.json(item, 201);
});

liveProjectsRoutes.patch('/:id/installation-items/:itemId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const item = await prisma.lQInstallationItem.update({
    where: { id: c.req.param('itemId') },
    data: {
      systemName: body.systemName,
      installationDate: body.installationDate ? new Date(body.installationDate) : undefined,
      commissionDate: body.commissionDate ? new Date(body.commissionDate) : undefined,
      amount: body.amount != null ? Number(body.amount) : undefined,
      paid: body.paid,
    },
  });
  return c.json(item);
});

liveProjectsRoutes.delete('/:id/installation-items/:itemId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  await prisma.lQInstallationItem.delete({ where: { id: c.req.param('itemId') } });
  return c.json({ ok: true });
});

// Components
liveProjectsRoutes.post('/:id/components', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const comp = await prisma.lQComponent.create({
    data: {
      liveProjectId: c.req.param('id'),
      componentName: body.componentName,
      qty: Number(body.qty) || 1,
      stockStatus: body.stockStatus ?? 'IN_STOCK',
      cost: body.cost != null ? Number(body.cost) : null,
    },
  });
  return c.json(comp, 201);
});

liveProjectsRoutes.patch('/:id/components/:compId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const comp = await prisma.lQComponent.update({
    where: { id: c.req.param('compId') },
    data: {
      componentName: body.componentName,
      qty: body.qty != null ? Number(body.qty) : undefined,
      stockStatus: body.stockStatus,
      cost: body.cost != null ? Number(body.cost) : undefined,
    },
  });
  return c.json(comp);
});

liveProjectsRoutes.delete('/:id/components/:compId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  await prisma.lQComponent.delete({ where: { id: c.req.param('compId') } });
  return c.json({ ok: true });
});
