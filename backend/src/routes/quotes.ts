import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';
import { PERMISSIONS } from '../lib/permissions.js';
import { logStageTransition } from '../lib/audit.js';
import type { QuoteStatus, EnquirySource } from '@prisma/client';

export const quotesRoutes = new Hono();

async function generateLqRef(): Promise<string> {
  const count = await prisma.liveProject.count();
  return `LQ-${String(count + 1).padStart(3, '0')}`;
}

async function generateQuoteRef(): Promise<string> {
  const count = await prisma.quote.count();
  return `Q-${String(count + 1).padStart(3, '0')}`;
}

function formatQuote(q: any) {
  return {
    id: q.id,
    quoteRef: q.quoteRef,
    status: q.status,
    enquirySource: q.enquirySource,
    customerName: q.customerName,
    customerEmail: q.customerEmail ?? '',
    customerPhone: q.customerPhone ?? '',
    siteAddress: q.siteAddress ?? '',
    siteType: q.siteType ?? '',
    supplyType: q.supplyType ?? '',
    productType: q.productType ?? '',
    widthMm: q.widthMm ?? null,
    heightMm: q.heightMm ?? null,
    nextAction: q.nextAction ?? '',
    nextActionDate: q.nextActionDate ?? null,
    assigneeId: q.assigneeId ?? '',
    assigneeName: q.assigneeName ?? '',
    probabilityScore: q.probabilityScore ?? null,
    orderValue: q.orderValue ?? null,
    notes: q.notes ?? '',
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}

quotesRoutes.get('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { status, source, search } = c.req.query();
  const where: any = {};
  if (status) where.status = status as QuoteStatus;
  if (source) where.enquirySource = source as EnquirySource;
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { quoteRef: { contains: search, mode: 'insensitive' } },
      { productType: { contains: search, mode: 'insensitive' } },
    ];
  }
  const quotes = await prisma.quote.findMany({ where, orderBy: { createdAt: 'desc' } });
  const total = quotes.length;
  const totalValue = quotes.reduce((sum, q) => sum + (q.orderValue ?? 0), 0);
  const avgValue = total > 0 ? totalValue / total : 0;
  return c.json({ quotes: quotes.map(formatQuote), kpis: { total, totalValue, avgValue } });
});

quotesRoutes.get('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const quote = await prisma.quote.findUnique({ where: { id: c.req.param('id') } });
  if (!quote) return c.json({ error: 'Not found' }, 404);
  return c.json(formatQuote(quote));
});

quotesRoutes.post('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const quoteRef = await generateQuoteRef();
  const quote = await prisma.quote.create({
    data: {
      quoteRef,
      status: 'NEW',
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      siteAddress: body.siteAddress,
      siteType: body.siteType,
      supplyType: body.supplyType,
      productType: body.productType,
      widthMm: body.widthMm ? Number(body.widthMm) : null,
      heightMm: body.heightMm ? Number(body.heightMm) : null,
      enquirySource: body.enquirySource,
      nextAction: body.nextAction,
      nextActionDate: body.nextActionDate ? new Date(body.nextActionDate) : null,
      assigneeId: body.assigneeId,
      assigneeName: body.assigneeName,
      probabilityScore: body.probabilityScore != null ? Number(body.probabilityScore) : null,
      orderValue: body.orderValue ? Number(body.orderValue) : null,
      notes: body.notes,
    },
  });
  return c.json(formatQuote(quote), 201);
});

// Convert Won quote to LQ (T-043, T-045 - workflow trigger R3)
quotesRoutes.post('/:id/convert-to-lq', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const quote = await prisma.quote.findUnique({ where: { id: c.req.param('id') } });
  if (!quote) return c.json({ error: 'Not found' }, 404);
  if (quote.status !== 'WON') return c.json({ error: 'Quote must be Won to convert' }, 400);

  const existing = await prisma.liveProject.findFirst({ where: { sourceQuoteId: quote.id } });
  if (existing) return c.json({ error: 'Already converted to LQ' }, 400);

  const lqRef = await generateLqRef();
  const lp = await prisma.liveProject.create({
    data: {
      lqRef,
      sourceQuoteId: quote.id,
      customerName: quote.customerName,
      customerEmail: quote.customerEmail,
      customerPhone: quote.customerPhone,
      siteAddress: quote.siteAddress,
      siteType: quote.siteType,
      supplyType: quote.supplyType,
      productType: quote.productType,
      widthMm: quote.widthMm,
      heightMm: quote.heightMm,
      totalContractValue: quote.orderValue,
    },
    include: {
      invoices: true, drawings: true,
      installationSchedule: true, components: true,
    },
  });

  const auth = c.get('user' as any);
  await logStageTransition({
    recordId: lp.id, recordType: 'LiveProject',
    actorId: auth?.sub ?? 'system', actorName: auth?.name ?? 'system',
    fromStage: 'QUOTE', toStage: 'LQ', method: 'NORMAL',
  });

  return c.json({ liveProjectId: lp.id, lqRef: lp.lqRef }, 201);
});

quotesRoutes.patch('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const allowed = [
    'status', 'enquirySource', 'customerName', 'customerEmail', 'customerPhone',
    'siteAddress', 'siteType', 'supplyType', 'productType', 'widthMm', 'heightMm',
    'nextAction', 'nextActionDate', 'assigneeId', 'assigneeName',
    'probabilityScore', 'orderValue', 'notes',
  ];
  const data: any = {};
  for (const key of allowed) {
    if (key in body) {
      if (key === 'nextActionDate') data[key] = body[key] ? new Date(body[key]) : null;
      else if (['widthMm', 'heightMm', 'probabilityScore'].includes(key))
        data[key] = body[key] != null ? Number(body[key]) : null;
      else if (key === 'orderValue')
        data[key] = body[key] != null ? Number(body[key]) : null;
      else data[key] = body[key];
    }
  }
  if (data.probabilityScore != null && (data.probabilityScore < 0 || data.probabilityScore > 100)) {
    return c.json({ error: 'probabilityScore must be 0–100' }, 400);
  }
  const quote = await prisma.quote.update({ where: { id: c.req.param('id') }, data });
  return c.json(formatQuote(quote));
});
