import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';
import { PERMISSIONS } from '../lib/permissions.js';
import { logStageTransition } from '../lib/audit.js';
import { getPresignedUploadUrl } from '../lib/s3.js';
import { parseQuotePdf } from '../lib/xero.js';
import type { ServiceQuoteStatus } from '@prisma/client';

export const serviceQuotesRoutes = new Hono();

async function generateSRef(): Promise<string> {
  const count = await prisma.serviceQuote.count();
  return `S-${String(count + 1).padStart(3, '0')}`;
}

async function generateLsRef(): Promise<string> {
  const count = await prisma.liveService.count();
  return `LS-${String(count + 1).padStart(3, '0')}`;
}

const STATUS_ORDER: ServiceQuoteStatus[] = ['QUOTE_DRAFTED', 'SENT', 'CHASING', 'ORDER_PLACED', 'LIVE_CLOSED'];

function formatSq(sq: any) {
  return {
    id: sq.id, sQuoteRef: sq.sQuoteRef, status: sq.status,
    customerName: sq.customerName, assetId: sq.assetId ?? null, assetRef: sq.assetRef ?? '',
    serviceCategory: sq.serviceCategory ?? '', contractType: sq.contractType ?? '',
    frequency: sq.frequency ?? null, numVisits: sq.numVisits ?? null,
    slaResponse: sq.slaResponse ?? '', slaResolution: sq.slaResolution ?? '',
    autoRenewal: sq.autoRenewal, fabricIncluded: sq.fabricIncluded, labourIncluded: sq.labourIncluded,
    serviceRate: sq.serviceRate ?? null, annualRevenueExVat: sq.annualRevenueExVat ?? null,
    annualRevenueIncVat: sq.annualRevenueIncVat ?? null, oneOffPayment: sq.oneOffPayment ?? null,
    paymentTerms: sq.paymentTerms ?? '', pricingHoldUntil: sq.pricingHoldUntil ?? null,
    contractStart: sq.contractStart ?? null, contractEnd: sq.contractEnd ?? null,
    probability: sq.probability ?? null, xeroSource: sq.xeroSource ?? null, xeroDocumentKey: sq.xeroDocumentKey ?? null,
    chaseEntries: (sq.chaseEntries ?? []).map((e: any) => ({
      id: e.id, chaseDate: e.chaseDate, chasedBy: e.chasedBy, method: e.method ?? '',
      outcome: e.outcome ?? '', nextActionDate: e.nextActionDate ?? null,
    })),
    createdAt: sq.createdAt, updatedAt: sq.updatedAt,
  };
}

serviceQuotesRoutes.get('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const sq = await prisma.serviceQuote.findMany({
    include: { chaseEntries: { orderBy: { chaseDate: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  return c.json(sq.map(formatSq));
});

serviceQuotesRoutes.get('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const sq = await prisma.serviceQuote.findUnique({
    where: { id: c.req.param('id') },
    include: { chaseEntries: { orderBy: { chaseDate: 'asc' } } },
  });
  if (!sq) return c.json({ error: 'Not found' }, 404);
  return c.json(formatSq(sq));
});

serviceQuotesRoutes.post('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const sQuoteRef = await generateSRef();
  const sq = await prisma.serviceQuote.create({
    data: { sQuoteRef, customerName: body.customerName, assetId: body.assetId, assetRef: body.assetRef },
    include: { chaseEntries: true },
  });
  return c.json(formatSq(sq), 201);
});

serviceQuotesRoutes.patch('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const dateFields = ['pricingHoldUntil', 'contractStart', 'contractEnd'];
  const floatFields = ['serviceRate', 'annualRevenueExVat', 'annualRevenueIncVat', 'oneOffPayment'];
  const intFields = ['numVisits', 'probability'];
  const data: any = {};
  for (const [k, v] of Object.entries(body)) {
    if (dateFields.includes(k)) data[k] = v ? new Date(v as string) : null;
    else if (floatFields.includes(k)) data[k] = v != null ? Number(v) : null;
    else if (intFields.includes(k)) {
      const n = Number(v);
      if (k === 'probability' && (n < 0 || n > 100)) continue;
      data[k] = v != null ? n : null;
    } else data[k] = v;
  }
  const sq = await prisma.serviceQuote.update({
    where: { id: c.req.param('id') }, data,
    include: { chaseEntries: { orderBy: { chaseDate: 'asc' } } },
  });
  return c.json(formatSq(sq));
});

// Status advancement (forward only, admin can back-transition)
serviceQuotesRoutes.post('/:id/advance-status', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const id = c.req.param('id');
  const { targetStatus } = await c.req.json() as { targetStatus: ServiceQuoteStatus };
  const sq = await prisma.serviceQuote.findUnique({ where: { id } });
  if (!sq) return c.json({ error: 'Not found' }, 404);
  const currentIdx = STATUS_ORDER.indexOf(sq.status);
  const targetIdx = STATUS_ORDER.indexOf(targetStatus);
  const auth = c.get('user' as any);
  const isAdmin = auth?.['custom:role'] === 'ADMIN';
  if (targetIdx < currentIdx && !isAdmin) {
    return c.json({ error: 'Back-transition requires Admin role' }, 403);
  }
  const updated = await prisma.serviceQuote.update({
    where: { id }, data: { status: targetStatus },
    include: { chaseEntries: { orderBy: { chaseDate: 'asc' } } },
  });
  await logStageTransition({
    recordId: id, recordType: 'ServiceQuote',
    actorId: auth?.sub ?? 'system', actorName: auth?.name ?? 'system',
    fromStage: sq.status, toStage: targetStatus, method: 'NORMAL',
  });
  return c.json(formatSq(updated));
});

// Convert to LS
serviceQuotesRoutes.post('/:id/convert-to-ls', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const id = c.req.param('id');
  const sq = await prisma.serviceQuote.findUnique({ where: { id } });
  if (!sq) return c.json({ error: 'Not found' }, 404);
  if (sq.status !== 'ORDER_PLACED') return c.json({ error: 'Must be Order Placed to convert' }, 400);
  const lsRef = await generateLsRef();
  const ls = await prisma.liveService.create({
    data: {
      lsRef,
      sourceServiceQuoteId: sq.id,
      customerName: sq.customerName,
      assetId: sq.assetId,
    },
  });
  const auth = c.get('user' as any);
  await logStageTransition({
    recordId: ls.id, recordType: 'LiveService',
    actorId: auth?.sub ?? 'system', actorName: auth?.name ?? 'system',
    fromStage: 'SERVICE_QUOTE', toStage: 'LS', method: 'NORMAL',
  });
  return c.json({ liveServiceId: ls.id, lsRef: ls.lsRef }, 201);
});

// Xero document source: upload URL
serviceQuotesRoutes.post('/:id/xero-upload-url', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { contentType } = await c.req.json();
  const prefix = `service-quotes/${c.req.param('id')}`;
  const url = await getPresignedUploadUrl(prefix, 'xero-quote.pdf', contentType || 'application/pdf');
  await prisma.serviceQuote.update({
    where: { id: c.req.param('id') },
    data: { xeroSource: 'UPLOAD', xeroDocumentKey: `${prefix}/xero-quote.pdf` },
  });
  return c.json({ url });
});

// Xero import
serviceQuotesRoutes.post('/:id/xero-import', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { xeroId } = await c.req.json();
  try {
    const data = await parseQuotePdf(Buffer.from(''));
    await prisma.serviceQuote.update({
      where: { id: c.req.param('id') },
      data: {
        xeroSource: 'API', xeroDocumentKey: xeroId,
        serviceRate: data?.quoteValue ?? undefined,
      },
    });
    return c.json({ ok: true, data });
  } catch (e: any) {
    return c.json({ error: e.message }, 422);
  }
});

// Chase entries
serviceQuotesRoutes.post('/:id/chase-entries', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const entry = await prisma.chaseEntry.create({
    data: {
      serviceQuoteId: c.req.param('id'),
      chaseDate: new Date(body.chaseDate),
      chasedBy: body.chasedBy,
      method: body.method,
      outcome: body.outcome,
      nextActionDate: body.nextActionDate ? new Date(body.nextActionDate) : null,
    },
  });
  return c.json(entry, 201);
});

// Audit trail — reads from StageTransitionLog for this service quote
serviceQuotesRoutes.get('/:id/audit', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const entries = await prisma.stageTransitionLog.findMany({
    where: { recordId: c.req.param('id') },
    orderBy: { createdAt: 'desc' },
  });
  return c.json(entries);
});

serviceQuotesRoutes.delete('/:id/chase-entries/:entryId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  await prisma.chaseEntry.delete({ where: { id: c.req.param('entryId') } });
  return c.json({ ok: true });
});

// Live Service CRUD
export const liveServicesRoutes = new Hono();

function formatLs(ls: any) {
  return {
    id: ls.id, lsRef: ls.lsRef, sourceServiceQuoteId: ls.sourceServiceQuoteId ?? null,
    customerName: ls.customerName, assetId: ls.assetId ?? null,
    serviceDate: ls.serviceDate ?? null, startTime: ls.startTime ?? '', endTime: ls.endTime ?? '',
    firmTime: ls.firmTime, engineerId: ls.engineerId ?? '', engineerName: ls.engineerName ?? '',
    team: ls.team ?? '', hoursPlanned: ls.hoursPlanned ?? null,
    outOfServiceRequired: ls.outOfServiceRequired, holdRequired: ls.holdRequired, followUpRequired: ls.followUpRequired,
    accessNotes: ls.accessNotes ?? '', ramsUploaded: ls.ramsUploaded, ramsReviewed: ls.ramsReviewed,
    inductionRequired: ls.inductionRequired, siteAccessTimes: ls.siteAccessTimes ?? '', parking: ls.parking ?? '',
    pasmaRequired: ls.pasmaRequired, heightRequired: ls.heightRequired, accessAgreed: ls.accessAgreed,
    harnessRequired: ls.harnessRequired, cameraRequired: ls.cameraRequired,
    totalComponents: ls.totalComponents, toOrderComponents: ls.toOrderComponents,
    outOfStockComponents: ls.outOfStockComponents, estimatedWeight: ls.estimatedWeight ?? null,
    drawingsAvailable: ls.drawingsAvailable, methodStatement: ls.methodStatement,
    riskAssessment: ls.riskAssessment, prevServiceReport: ls.prevServiceReport, sitePhotos: ls.sitePhotos,
    accountManager: ls.accountManager ?? '', accountNumber: ls.accountNumber ?? '',
    outstandingBalance: ls.outstandingBalance ?? null, invoiceStatus: ls.invoiceStatus ?? '',
    poNumber: ls.poNumber ?? '', warrantyApproved: ls.warrantyApproved, creditHold: ls.creditHold,
    specNotes: ls.specNotes ?? '', specRequiredBy: ls.specRequiredBy ?? null, specPriority: ls.specPriority ?? '',
    createdAt: ls.createdAt, updatedAt: ls.updatedAt,
  };
}

liveServicesRoutes.get('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const services = await prisma.liveService.findMany({ orderBy: { createdAt: 'desc' } });
  return c.json(services.map(formatLs));
});

liveServicesRoutes.get('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const ls = await prisma.liveService.findUnique({ where: { id: c.req.param('id') } });
  if (!ls) return c.json({ error: 'Not found' }, 404);
  return c.json(formatLs(ls));
});

liveServicesRoutes.patch('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const dateFields = ['serviceDate', 'specRequiredBy'];
  const floatFields = ['hoursPlanned', 'estimatedWeight', 'outstandingBalance'];
  const intFields = ['totalComponents', 'toOrderComponents', 'outOfStockComponents'];
  const data: any = {};
  for (const [k, v] of Object.entries(body)) {
    if (dateFields.includes(k)) data[k] = v ? new Date(v as string) : null;
    else if (floatFields.includes(k)) data[k] = v != null ? Number(v) : null;
    else if (intFields.includes(k)) data[k] = v != null ? Number(v) : null;
    else data[k] = v;
  }
  const ls = await prisma.liveService.update({ where: { id: c.req.param('id') }, data });
  return c.json(formatLs(ls));
});
