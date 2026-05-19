import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';
import { PERMISSIONS } from '../lib/permissions.js';
import { getPresignedUploadUrl, getPresignedDownloadUrl } from '../lib/s3.js';
import { generateDocument } from '../lib/pdf.js';
import { sendEmail } from '../lib/email.js';
import { logStageTransition } from '../lib/audit.js';
import type { DistributionType, PaymentMilestoneStatus } from '@prisma/client';

export const distributionRoutes = new Hono();

async function generateDjRef(): Promise<string> {
  const count = await prisma.distributionJob.count();
  return `DJ-${String(count + 1).padStart(3, '0')}`;
}

function formatDj(dj: any) {
  return {
    id: dj.id, djRef: dj.djRef, distributionType: dj.distributionType,
    mfgJobId: dj.mfgJobId, liveProjectId: dj.liveProjectId, liveServiceId: dj.liveServiceId,
    customerName: dj.customerName, siteName: dj.siteName,
    // 6A
    accountsReleaseApproved: dj.accountsReleaseApproved,
    accountsReleaseApprovedBy: dj.accountsReleaseApprovedBy,
    packMccCert: dj.packMccCert, packCurtainScope: dj.packCurtainScope,
    packFiringLicence: dj.packFiringLicence, packLabelsId: dj.packLabelsId,
    packControllersManual: dj.packControllersManual, packWarrantyCert: dj.packWarrantyCert,
    collectionSignature: dj.collectionSignature, collectedAt: dj.collectedAt,
    collectionRep: dj.collectionRep, pocGenerated: dj.pocGenerated,
    // 6B
    despatchDate: dj.despatchDate, carrier: dj.carrier,
    trackingNumber: dj.trackingNumber, palletBoxCount: dj.palletBoxCount,
    trackingLink: dj.trackingLink, despatchNotes: dj.despatchNotes,
    deliveryMccCert: dj.deliveryMccCert, deliveryCurtainScope: dj.deliveryCurtainScope,
    deliveryFiringLicence: dj.deliveryFiringLicence, deliveryLabelsId: dj.deliveryLabelsId,
    deliveryControllersManual: dj.deliveryControllersManual, deliveryWarrantyCert: dj.deliveryWarrantyCert,
    deliverySignature: dj.deliverySignature, deliverySignedOffAt: dj.deliverySignedOffAt,
    podGenerated: dj.podGenerated, courierName: dj.courierName, driverName: dj.driverName,
    // 6C
    ramsUploaded: dj.ramsUploaded, ramsReviewed: dj.ramsReviewed,
    dateIn: dj.dateIn, daysOnSite: dj.daysOnSite,
    estimatedCompletion: dj.estimatedCompletion, extendedFlag: dj.extendedFlag,
    returnVisit: dj.returnVisit,
    ramsFiledChecked: dj.ramsFiledChecked, teamSignedOffChecked: dj.teamSignedOffChecked,
    customerSignoffUploaded: dj.customerSignoffUploaded, handoverPackIssued: dj.handoverPackIssued,
    returnVisitResolved: dj.returnVisitResolved, commissionDate: dj.commissionDate,
    djStatus: dj.djStatus ?? 'PENDING',
    engineers: dj.engineers ?? [],
    milestones: dj.milestones ?? [],
    progressSteps: dj.progressSteps ?? [],
    documents: dj.documents ?? [],
    createdAt: dj.createdAt, updatedAt: dj.updatedAt,
  };
}

const INCLUDE_ALL = {
  engineers: true, milestones: true, progressSteps: true, documents: true,
};

distributionRoutes.get('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { mfgJobId, liveProjectId, liveServiceId } = c.req.query();
  const where: any = {};
  if (mfgJobId) where.mfgJobId = mfgJobId;
  if (liveProjectId) where.liveProjectId = liveProjectId;
  if (liveServiceId) where.liveServiceId = liveServiceId;
  const djs = await prisma.distributionJob.findMany({ where, include: INCLUDE_ALL, orderBy: { createdAt: 'desc' } });
  return c.json(djs.map(formatDj));
});

distributionRoutes.post('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const djRef = await generateDjRef();
  const dj = await prisma.distributionJob.create({
    data: {
      djRef,
      distributionType: body.distributionType as DistributionType,
      mfgJobId: body.mfgJobId,
      liveProjectId: body.liveProjectId,
      liveServiceId: body.liveServiceId,
      customerName: body.customerName,
      siteName: body.siteName,
    },
    include: INCLUDE_ALL,
  });
  return c.json(formatDj(dj), 201);
});

distributionRoutes.get('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const dj = await prisma.distributionJob.findUnique({ where: { id: c.req.param('id') }, include: INCLUDE_ALL });
  if (!dj) return c.json({ error: 'Not found' }, 404);
  return c.json(formatDj(dj));
});

distributionRoutes.patch('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const dateFields = ['despatchDate', 'dateIn', 'estimatedCompletion', 'commissionDate', 'deliverySignedOffAt', 'collectedAt'];
  const data: any = {};
  for (const [key, val] of Object.entries(body)) {
    if (dateFields.includes(key)) data[key] = val ? new Date(val as string) : null;
    else if (key === 'palletBoxCount' || key === 'daysOnSite') data[key] = val != null ? Number(val) : null;
    else data[key] = val;
  }

  // T-082: Asset auto-creation on installation sign-off
  const prev = await prisma.distributionJob.findUnique({ where: { id: c.req.param('id') } });
  const dj = await prisma.distributionJob.update({ where: { id: c.req.param('id') }, data, include: INCLUDE_ALL });

  if (!prev?.customerSignoffUploaded && dj.customerSignoffUploaded && dj.distributionType === 'INSTALLATION') {
    try {
      const systemsToCreate: Array<{ family?: string; variant?: string; widthMm?: number; heightMm?: number }> = [];
      if (dj.mfgJobId) {
        const mfgJob = await prisma.manufacturingJob.findUnique({
          where: { id: dj.mfgJobId },
          include: { pack: { include: { systems: true } } },
        });
        if (mfgJob?.pack?.systems?.length) {
          for (const sys of mfgJob.pack.systems) {
            systemsToCreate.push({ family: sys.family ?? undefined, variant: sys.variant ?? undefined, widthMm: sys.widthMm ?? undefined, heightMm: sys.heightMm ?? undefined });
          }
        }
      }
      if (systemsToCreate.length === 0) systemsToCreate.push({});

      for (const sys of systemsToCreate) {
        const count = await prisma.asset.count();
        const assetRef = `AST-${String(count + 1).padStart(3, '0')}`;
        await prisma.asset.create({
          data: {
            assetRef,
            customerName: dj.customerName ?? undefined,
            siteName: dj.siteName ?? undefined,
            lqId: dj.liveProjectId ?? undefined,
            systemType: sys.family ?? 'Fire Curtain',
            widthMm: sys.widthMm ?? undefined,
            heightMm: sys.heightMm ?? undefined,
            serviceFrequencyMonths: 12,
            lastServiceDate: new Date(),
            nextServiceDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 12); return d; })(),
          },
        });
      }
    } catch {
      // Non-fatal — main update already succeeded
    }
  }

  return c.json(formatDj(dj));
});

// Accounts release (T-122) — Finance only
distributionRoutes.post('/:id/approve-release', requireRole('ADMIN', 'FINANCE_ACCOUNTS'), async (c) => {
  const { approvedBy } = await c.req.json();
  const dj = await prisma.distributionJob.update({
    where: { id: c.req.param('id') },
    data: { accountsReleaseApproved: true, accountsReleaseApprovedBy: approvedBy },
    include: INCLUDE_ALL,
  });
  return c.json(formatDj(dj));
});

// POC / POD generation
// T-147: Certificate release gate — Finance or Admin only
distributionRoutes.post('/:id/release-certificates', requireRole('ADMIN', 'FINANCE_ACCOUNTS'), async (c) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => ({})) as { reason?: string };
  const dj = await prisma.distributionJob.update({
    where: { id: c.req.param('id') },
    data: { certificatesReleased: true, certificateReleasedBy: user.sub },
    include: INCLUDE_ALL,
  });
  await logStageTransition({
    recordId: dj.id, recordType: 'DistributionJob',
    actorId: user.sub, actorName: [user.given_name, user.family_name].filter(Boolean).join(' ') || user.sub,
    fromStage: 'LOCKED', toStage: 'RELEASED',
    method: 'ADMIN_OVERRIDE',
    overrideReason: body.reason ?? 'Certificate release approved',
  }).catch(() => {});
  return c.json(formatDj(dj));
});

distributionRoutes.post('/:id/generate-poc', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const dj = await prisma.distributionJob.findUnique({ where: { id: c.req.param('id') }, include: INCLUDE_ALL });
  if (!dj) return c.json({ error: 'Not found' }, 404);
  const buffer = await generateDocument('PROOF_OF_COLLECTION', formatDj(dj));
  await prisma.distributionJob.update({ where: { id: dj.id }, data: { pocGenerated: true, djStatus: 'COLLECTED' } });
  c.header('Content-Type', 'application/pdf');
  c.header('Content-Disposition', `attachment; filename="POC-${dj.djRef}.pdf"`);
  return c.body(buffer as any);
});

distributionRoutes.post('/:id/generate-pod', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const dj = await prisma.distributionJob.findUnique({ where: { id: c.req.param('id') }, include: INCLUDE_ALL });
  if (!dj) return c.json({ error: 'Not found' }, 404);
  const buffer = await generateDocument('PROOF_OF_DELIVERY', formatDj(dj));
  await prisma.distributionJob.update({ where: { id: dj.id }, data: { podGenerated: true, djStatus: 'DELIVERED' } });

  // T-130 / T-144: Auto-notifications on POD with document link — Sales, Finance, Client
  const notifyTargets = [
    { role: 'Sales', email: process.env.SALES_EMAIL ?? 'sales@example.com' },
    { role: 'Finance', email: process.env.FINANCE_EMAIL ?? 'finance@example.com' },
    { role: 'Client', email: process.env.CLIENT_EMAIL ?? 'client@example.com' },
  ];
  await Promise.allSettled(notifyTargets.map(({ role, email }) =>
    sendEmail(
      email,
      `Delivery Confirmation — POD Generated for ${dj.djRef}`,
      `<p>Dear ${role},</p><p>A Proof of Delivery has been generated for job <strong>${dj.djRef}</strong> (${dj.customerName ?? 'Unknown'}).</p><p>Delivery signed off at: ${dj.deliverySignedOffAt ? new Date(dj.deliverySignedOffAt).toLocaleString('en-GB') : 'N/A'}</p><p>The POD document is available at: ${process.env.APP_URL ?? 'https://app.firecurtains.local'}/dashboard/distribution/${dj.id}</p>`,
      [{ filename: `POD-${dj.djRef}.pdf`, content: buffer as Buffer, contentType: 'application/pdf' }],
    )
  ));

  c.header('Content-Type', 'application/pdf');
  c.header('Content-Disposition', `attachment; filename="POD-${dj.djRef}.pdf"`);
  return c.body(buffer as any);
});

// Engineers (T-134)
distributionRoutes.post('/:id/engineers', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const eng = await prisma.installationEngineer.create({
    data: { djId: c.req.param('id'), engineerName: body.engineerName, engineerId: body.engineerId },
  });
  return c.json(eng, 201);
});

distributionRoutes.patch('/:id/engineers/:engId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const data: any = {};
  const numFields = ['miles', 'travelCost', 'nightRate', 'offSpecRate', 'hotelCost'];
  for (const [key, val] of Object.entries(body)) {
    if (numFields.includes(key)) data[key] = val != null ? Number(val) : null;
    else data[key] = val;
  }
  const eng = await prisma.installationEngineer.update({ where: { id: c.req.param('engId') }, data });
  return c.json(eng);
});

distributionRoutes.delete('/:id/engineers/:engId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  await prisma.installationEngineer.delete({ where: { id: c.req.param('engId') } });
  return c.json({ ok: true });
});

// Milestones (T-137)
distributionRoutes.post('/:id/milestones', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const m = await prisma.paymentMilestone.create({
    data: {
      djId: c.req.param('id'),
      name: body.name,
      amount: body.amount ? Number(body.amount) : null,
      triggerEvent: body.triggerEvent,
      status: (body.status ?? 'PENDING') as PaymentMilestoneStatus,
    },
  });
  return c.json(m, 201);
});

distributionRoutes.patch('/:id/milestones/:milestoneId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const m = await prisma.paymentMilestone.update({
    where: { id: c.req.param('milestoneId') },
    data: {
      status: body.status as PaymentMilestoneStatus,
      amount: body.amount != null ? Number(body.amount) : undefined,
      name: body.name,
      triggerEvent: body.triggerEvent,
    },
  });

  // T-145: Payment milestone PAID → notify Finance
  if (body.status === 'PAID') {
    const dj = await prisma.distributionJob.findUnique({ where: { id: c.req.param('id') } });
    try {
      await sendEmail(
        process.env.FINANCE_EMAIL ?? 'finance@example.com',
        `Payment Milestone Paid — ${dj?.djRef ?? c.req.param('id')}`,
        `<p>Milestone <strong>${m.name ?? 'Unknown'}</strong> has been marked as PAID for job ${dj?.djRef ?? ''}.</p><p>Amount: £${m.amount?.toFixed(2) ?? '—'}</p>`,
      );
    } catch { /* non-fatal */ }
  }

  return c.json(m);
});

// Progress steps (T-141)
distributionRoutes.post('/:id/progress-steps', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const step = await prisma.installationProgressStep.create({
    data: {
      djId: c.req.param('id'),
      stepName: body.stepName,
      stepDate: body.stepDate ? new Date(body.stepDate) : null,
    },
  });
  return c.json(step, 201);
});

distributionRoutes.patch('/:id/progress-steps/:stepId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const step = await prisma.installationProgressStep.update({
    where: { id: c.req.param('stepId') },
    data: { stepDate: body.stepDate ? new Date(body.stepDate) : null, stepName: body.stepName },
  });
  return c.json(step);
});

// Documents (T-136)
distributionRoutes.post('/:id/documents/upload-url', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { docType, contentType } = await c.req.json();
  const fileName = `${docType.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  const prefix = `distribution/${c.req.param('id')}/documents`;
  const url = await getPresignedUploadUrl(prefix, fileName, contentType || 'application/pdf');
  const doc = await prisma.distributionDocument.create({
    data: { djId: c.req.param('id'), docType, fileName, s3Key: `${prefix}/${fileName}` },
  });
  return c.json({ url, fileName, documentId: doc.id });
});

distributionRoutes.get('/:id/documents/download-url', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { docType } = c.req.query();
  const fileName = `${(docType as string).replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  const prefix = `distribution/${c.req.param('id')}/documents`;
  const url = await getPresignedDownloadUrl(prefix, fileName);
  return c.json({ url });
});
