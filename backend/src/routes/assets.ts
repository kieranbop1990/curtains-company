import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';
import { PERMISSIONS } from '../lib/permissions.js';
import { getPresignedUploadUrl, getPresignedDownloadUrl, listFiles } from '../lib/s3.js';
import { generateDocument } from '../lib/pdf.js';
import { sendServiceDueAlert, sendRenewalReminder } from '../lib/email.js';
import type { AssetStatus, AssetPriority } from '@prisma/client';

export const assetsRoutes = new Hono();

async function generateAssetRef(): Promise<string> {
  const count = await prisma.asset.count();
  return `AST-${String(count + 1).padStart(3, '0')}`;
}

function formatAsset(a: any) {
  return {
    id: a.id,
    assetRef: a.assetRef,
    status: a.status,
    priority: a.priority,
    lqId: a.lqId,
    isExternalSource: a.isExternalSource,
    customerName: a.customerName ?? '',
    siteName: a.siteName ?? '',
    siteAddress: a.siteAddress ?? '',
    systemType: a.systemType ?? '',
    firingRating: a.firingRating ?? '',
    locationOnSite: a.locationOnSite ?? '',
    headboxSize: a.headboxSize ?? '',
    motorType: a.motorType ?? '',
    controlPanelType: a.controlPanelType ?? '',
    mccType: a.mccType ?? '',
    driveType: a.driveType ?? '',
    motorMake: a.motorMake ?? '',
    serialNumber: a.serialNumber ?? '',
    manufactureDate: a.manufactureDate ?? null,
    warrantyExpiry: a.warrantyExpiry ?? null,
    fabricType: a.fabricType ?? '',
    fabricColour: a.fabricColour ?? '',
    widthMm: a.widthMm ?? null,
    heightMm: a.heightMm ?? null,
    serviceFrequencyMonths: a.serviceFrequencyMonths ?? null,
    lastServiceDate: a.lastServiceDate ?? null,
    nextServiceDate: a.nextServiceDate ?? null,
    renewalAlertDate: a.renewalAlertDate ?? null,
    accessRestrictions: a.accessRestrictions,
    permitsRequired: a.permitsRequired,
    dchiRequired: a.dchiRequired,
    securityClearance: a.securityClearance,
    loadingBay: a.loadingBay,
    laddersRequired: a.laddersRequired,
    inductionRequired: a.inductionRequired,
    lastQuoteDate: a.lastQuoteDate ?? null,
    lastContactDate: a.lastContactDate ?? null,
    nextCloseDate: a.nextCloseDate ?? null,
    contractValue: a.contractValue ?? null,
    annualRevenue: a.annualRevenue ?? null,
    contacts: (a.contacts ?? []).map((c: any) => ({
      id: c.id, name: c.name, phone: c.phone ?? '', email: c.email ?? '',
    })),
    serviceEvents: (a.serviceEvents ?? []).map((e: any) => ({
      id: e.id, serviceDate: e.serviceDate, engineerName: e.engineerName ?? '',
      company: e.company ?? '', summary: e.summary ?? '', statusLabel: e.statusLabel ?? '',
    })),
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

assetsRoutes.get('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { status, priority, search } = c.req.query();
  const where: any = {};
  if (status) where.status = status as AssetStatus;
  if (priority) where.priority = priority as AssetPriority;
  if (search) {
    where.OR = [
      { assetRef: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { siteName: { contains: search, mode: 'insensitive' } },
      { serialNumber: { contains: search, mode: 'insensitive' } },
    ];
  }
  const assets = await prisma.asset.findMany({
    where,
    include: { contacts: true, serviceEvents: { orderBy: { serviceDate: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  });
  return c.json(assets.map(formatAsset));
});

assetsRoutes.get('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const asset = await prisma.asset.findUnique({
    where: { id: c.req.param('id') },
    include: { contacts: true, serviceEvents: { orderBy: { serviceDate: 'desc' } } },
  });
  if (!asset) return c.json({ error: 'Not found' }, 404);

  // Auto-update status based on next service date
  if (asset.nextServiceDate) {
    const now = new Date();
    const daysUntil = Math.floor((asset.nextServiceDate.getTime() - now.getTime()) / 86400000);
    let computedStatus: AssetStatus = 'LIVE_ACTIVE';
    if (daysUntil < 0) computedStatus = 'OVERDUE';
    else if (daysUntil <= 30) computedStatus = 'SERVICE_DUE';
    if (computedStatus !== asset.status) {
      await prisma.asset.update({ where: { id: asset.id }, data: { status: computedStatus } });
      asset.status = computedStatus;
    }
  }

  return c.json(formatAsset(asset));
});

assetsRoutes.post('/', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const assetRef = await generateAssetRef();
  const asset = await prisma.asset.create({
    data: {
      assetRef,
      status: body.lqId ? 'UNKNOWN' : 'UNKNOWN',
      isExternalSource: !body.lqId,
      lqId: body.lqId ?? null,
      customerName: body.customerName,
      siteName: body.siteName,
      siteAddress: body.siteAddress,
      systemType: body.systemType,
    },
    include: { contacts: true, serviceEvents: true },
  });
  return c.json(formatAsset(asset), 201);
});

assetsRoutes.patch('/:id', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const dateFields = ['manufactureDate', 'warrantyExpiry', 'lastServiceDate', 'nextServiceDate',
    'renewalAlertDate', 'lastQuoteDate', 'lastContactDate', 'nextCloseDate'];
  const intFields = ['widthMm', 'heightMm', 'serviceFrequencyMonths'];
  const floatFields = ['contractValue', 'annualRevenue'];
  const data: any = {};
  for (const [key, val] of Object.entries(body)) {
    if (dateFields.includes(key)) data[key] = val ? new Date(val as string) : null;
    else if (intFields.includes(key)) data[key] = val != null ? Number(val) : null;
    else if (floatFields.includes(key)) data[key] = val != null ? Number(val) : null;
    else data[key] = val;
  }
  const asset = await prisma.asset.update({
    where: { id: c.req.param('id') },
    data,
    include: { contacts: true, serviceEvents: { orderBy: { serviceDate: 'desc' } } },
  });
  return c.json(formatAsset(asset));
});

// Contacts
assetsRoutes.post('/:id/contacts', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const contact = await prisma.assetContact.create({
    data: { assetId: c.req.param('id'), name: body.name, phone: body.phone, email: body.email },
  });
  return c.json(contact, 201);
});

assetsRoutes.delete('/:id/contacts/:contactId', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  await prisma.assetContact.delete({ where: { id: c.req.param('contactId') } });
  return c.json({ ok: true });
});

// Workflow trigger R13: check service alerts and send email (T-084, T-085)
assetsRoutes.post('/:id/check-alerts', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const asset = await prisma.asset.findUnique({
    where: { id: c.req.param('id') },
    include: { contacts: true },
  });
  if (!asset) return c.json({ error: 'Not found' }, 404);
  const alerts: string[] = [];

  if (asset.nextServiceDate) {
    const now = new Date();
    const daysUntil = Math.floor((asset.nextServiceDate.getTime() - now.getTime()) / 86400000);
    let newStatus: AssetStatus = asset.status;

    if (daysUntil < 0) {
      newStatus = 'OVERDUE';
      alerts.push('Asset is overdue for service');
    } else if (daysUntil <= 30) {
      newStatus = 'SERVICE_DUE';
      alerts.push(`Service due in ${daysUntil} days`);
    }

    if (newStatus !== asset.status) {
      await prisma.asset.update({ where: { id: asset.id }, data: { status: newStatus } });
    }

    // Send service due alert email (T-085)
    if (newStatus === 'SERVICE_DUE' || newStatus === 'OVERDUE') {
      const contactEmail = asset.contacts[0]?.email;
      const notifyEmail = contactEmail || process.env.DEFAULT_ALERT_EMAIL;
      if (notifyEmail) {
        try {
          await sendServiceDueAlert(notifyEmail, asset.assetRef, Math.max(0, daysUntil));
        } catch { /* email failure should not block response */ }
      }
    }
  }

  // Renewal reminder (T-086)
  if (asset.renewalAlertDate) {
    const daysToRenewal = Math.floor((asset.renewalAlertDate.getTime() - Date.now()) / 86400000);
    if (daysToRenewal >= 0 && daysToRenewal <= 30) {
      alerts.push(`Renewal alert in ${daysToRenewal} days`);
      const contactEmail = asset.contacts[0]?.email;
      const notifyEmail = contactEmail || process.env.DEFAULT_ALERT_EMAIL;
      if (notifyEmail) {
        try {
          await sendRenewalReminder(notifyEmail, asset.assetRef, asset.renewalAlertDate.toISOString().slice(0, 10));
        } catch { /* email failure should not block response */ }
      }
    }
  }

  return c.json({ alerts });
});

// Workflow R13: send renewal reminder email endpoint (T-086)
assetsRoutes.post('/:id/send-renewal-reminder', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { toEmail } = await c.req.json();
  const asset = await prisma.asset.findUnique({ where: { id: c.req.param('id') } });
  if (!asset) return c.json({ error: 'Not found' }, 404);
  if (!asset.renewalAlertDate) return c.json({ error: 'No renewal date set' }, 400);
  await sendRenewalReminder(toEmail, asset.assetRef, asset.renewalAlertDate.toISOString().slice(0, 10));
  return c.json({ ok: true });
});

// Linked assets (same site)
assetsRoutes.get('/:id/linked', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const asset = await prisma.asset.findUnique({ where: { id: c.req.param('id') } });
  if (!asset || !asset.siteName) return c.json([]);
  const linked = await prisma.asset.findMany({
    where: { siteName: asset.siteName, id: { not: asset.id } },
    orderBy: { createdAt: 'desc' },
  });
  return c.json(linked.map(formatAsset));
});

// PDF export
assetsRoutes.get('/:id/pdf', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const asset = await prisma.asset.findUnique({ where: { id: c.req.param('id') } });
  if (!asset) return c.json({ error: 'Not found' }, 404);
  const buffer = await generateDocument('ASSET_PROFILE', formatAsset(asset));
  c.header('Content-Type', 'application/pdf');
  c.header('Content-Disposition', `attachment; filename="asset-${asset.assetRef}.pdf"`);
  return c.body(buffer as any);
});

// Document upload/download via S3 presigned URLs
assetsRoutes.get('/:id/documents', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const prefix = `assets/${c.req.param('id')}/documents`;
  const files = await listFiles(prefix);
  return c.json(files);
});

assetsRoutes.post('/:id/documents/upload-url', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { docType, contentType } = await c.req.json();
  const fileName = `${docType.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  const prefix = `assets/${c.req.param('id')}/documents`;
  const url = await getPresignedUploadUrl(prefix, fileName, contentType || 'application/pdf');
  return c.json({ url, fileName });
});

assetsRoutes.get('/:id/documents/download-url', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const { docType } = c.req.query();
  const fileName = `${(docType as string).replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  const prefix = `assets/${c.req.param('id')}/documents`;
  const url = await getPresignedDownloadUrl(prefix, fileName);
  return c.json({ url });
});

// Service events
assetsRoutes.post('/:id/service-events', requireRole(...PERMISSIONS.fullCrm as any), async (c) => {
  const body = await c.req.json();
  const event = await prisma.assetServiceEvent.create({
    data: {
      assetId: c.req.param('id'),
      serviceDate: new Date(body.serviceDate),
      engineerId: body.engineerId,
      engineerName: body.engineerName,
      company: body.company,
      summary: body.summary,
      statusLabel: body.statusLabel,
    },
  });
  return c.json(event, 201);
});
