import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';
import { PERMISSIONS } from '../lib/permissions.js';
import { getPresignedUploadUrl } from '../lib/s3.js';
import { sendEmail } from '../lib/email.js';

export const fieldEngineerRoutes = new Hono();

// Own jobs only — filter by engineerId matching current user sub (T-152)
fieldEngineerRoutes.get('/my-jobs', requireRole(...PERMISSIONS.fieldEngineer as any), async (c) => {
  const user = c.get('user');
  const jobs = await prisma.distributionJob.findMany({
    where: {
      distributionType: 'INSTALLATION',
      engineers: { some: { engineerId: user.sub } },
    },
    include: { engineers: true, progressSteps: true, milestones: true, documents: true },
    orderBy: { dateIn: 'asc' },
  });
  return c.json(jobs);
});

// Get single job — own-jobs enforced
fieldEngineerRoutes.get('/my-jobs/:djId', requireRole(...PERMISSIONS.fieldEngineer as any), async (c) => {
  const user = c.get('user');
  const job = await prisma.distributionJob.findUnique({
    where: { id: c.req.param('djId') },
    include: { engineers: true, progressSteps: true, milestones: true, documents: true },
  });
  if (!job) return c.json({ error: 'Not found' }, 404);
  if (user.role !== 'ADMIN') {
    const isAssigned = job.engineers.some(e => e.engineerId === user.sub);
    if (!isAssigned) return c.json({ error: 'Forbidden — not assigned to this job' }, 403);
  }
  return c.json(job);
});

// Submit day record: update customerSignoffUploaded + add progress step
fieldEngineerRoutes.post('/my-jobs/:djId/submit-day', requireRole(...PERMISSIONS.fieldEngineer as any), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const job = await prisma.distributionJob.findUnique({
    where: { id: c.req.param('djId') },
    include: { engineers: true },
  });
  if (!job) return c.json({ error: 'Not found' }, 404);
  if (user.role !== 'ADMIN' && !job.engineers.some(e => e.engineerId === user.sub)) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const data: any = {};
  if (body.customerSignature) data.customerSignoffUploaded = true;

  // Workflow R10: final day submission → Awaiting Invoice status + Finance notification
  if (body.isFinalDay) {
    data.awaitingInvoice = true;
    try {
      await sendEmail(
        process.env.FINANCE_EMAIL ?? 'finance@example.com',
        `Invoice/Handover Check Required — ${job.djRef}`,
        `<p>Installation complete for job <strong>${job.djRef}</strong> (${job.customerName ?? 'Unknown Customer'}).</p><p>Please initiate invoice and handover checks. Job is now in Awaiting Invoice status.</p>`,
      );
    } catch {
      // Non-fatal — job still updated
    }
  }

  const updated = await prisma.distributionJob.update({
    where: { id: job.id },
    data,
    include: { engineers: true, progressSteps: true, milestones: true, documents: true },
  });

  if (body.dayLabel) {
    await prisma.installationProgressStep.create({
      data: {
        djId: job.id,
        stepName: body.dayLabel,
        stepDate: body.submittedAt ? new Date(body.submittedAt) : new Date(),
      },
    });
  }

  return c.json(updated);
});

// Photo upload URL
fieldEngineerRoutes.post('/my-jobs/:djId/media-upload-url', requireRole(...PERMISSIONS.fieldEngineer as any), async (c) => {
  const body = await c.req.json();
  const prefix = `field-engineer/${c.req.param('djId')}/media`;
  const fileName = `${Date.now()}-${body.fileName ?? 'photo.jpg'}`;
  const url = await getPresignedUploadUrl(prefix, fileName, body.contentType ?? 'image/jpeg');
  return c.json({ url, fileName });
});
