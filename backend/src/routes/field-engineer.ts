import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';
import { PERMISSIONS } from '../lib/permissions.js';
import { getPresignedUploadUrl, getPresignedDownloadUrl, listFiles } from '../lib/s3.js';
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

// RAMS documents — return presigned download URLs for all RAMS files uploaded to this job
fieldEngineerRoutes.get('/my-jobs/:djId/rams', requireRole(...PERMISSIONS.fieldEngineer as any), async (c) => {
  const user = c.get('user');
  const job = await prisma.distributionJob.findUnique({
    where: { id: c.req.param('djId') },
    include: { engineers: true },
  });
  if (!job) return c.json({ error: 'Not found' }, 404);
  if (user.role !== 'ADMIN' && !job.engineers.some(e => e.engineerId === user.sub)) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const prefix = `distribution/${c.req.param('djId')}/rams`;
  const files = await listFiles(prefix).catch(() => []);
  const docs = await Promise.all(
    files.map(async (f) => ({
      name: f.fileName,
      url: await getPresignedDownloadUrl(prefix, f.fileName).catch(() => ''),
    }))
  );
  return c.json(docs.filter(d => d.url));
});

// Report site issue — logged to audit trail and office email
fieldEngineerRoutes.post('/my-jobs/:djId/issues', requireRole(...PERMISSIONS.fieldEngineer as any), async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{ description: string; severity: string; hasPhoto?: boolean }>();
  const job = await prisma.distributionJob.findUnique({
    where: { id: c.req.param('djId') },
    include: { engineers: true },
  });
  if (!job) return c.json({ error: 'Not found' }, 404);
  if (user.role !== 'ADMIN' && !job.engineers.some(e => e.engineerId === user.sub)) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  await prisma.stageTransitionLog.create({
    data: {
      recordId: job.id,
      recordType: 'SiteIssue',
      actorId: user.sub,
      actorName: `${user.given_name ?? ''} ${user.family_name ?? ''}`.trim() || user.email,
      fromStage: body.severity,
      toStage: 'REPORTED',
      transitionMethod: 'NORMAL',
      overrideReason: body.description,
    },
  });

  try {
    await sendEmail(
      process.env.OFFICE_EMAIL ?? 'office@firecurtains.co.uk',
      `[${body.severity}] Site Issue Reported — ${job.djRef}`,
      `<p>A site issue has been reported by <strong>${user.given_name ?? user.email}</strong> on job <strong>${job.djRef}</strong> (${job.customerName ?? 'Unknown'}).</p>
<p><strong>Severity:</strong> ${body.severity}</p>
<p><strong>Description:</strong> ${body.description}</p>
${body.hasPhoto ? '<p><em>Photo attached — upload will follow.</em></p>' : ''}`,
    );
  } catch {
    // Non-fatal — issue is still logged
  }

  return c.json({ reported: true }, 201);
});

// SSE stream — broadcasts updates to office when field engineer submits
fieldEngineerRoutes.get('/my-jobs/:djId/events', requireRole(...PERMISSIONS.fieldEngineer as any), async (c) => {
  const djId = c.req.param('djId');
  return c.body(
    new ReadableStream({
      start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };
        // Send initial connected event
        send('connected', { djId, ts: new Date().toISOString() });
        // Keep-alive every 25s to prevent proxy timeouts
        const keepAlive = setInterval(() => {
          try { controller.enqueue(new TextEncoder().encode(': keep-alive\n\n')); } catch { clearInterval(keepAlive); }
        }, 25000);
        // Clean up on disconnect
        c.req.raw.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
          try { controller.close(); } catch { /* already closed */ }
        });
      },
    }),
    200,
    { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  );
});
