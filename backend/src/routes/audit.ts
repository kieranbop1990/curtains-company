import { Hono } from 'hono';
import { requireRole } from '../middleware/auth.js';
import { getTransitionLog } from '../lib/audit.js';

export const auditRoutes = new Hono();

auditRoutes.get(
  '/:recordType/:recordId',
  requireRole('ADMIN', 'OFFICE_OPERATIONS'),
  async (c) => {
    const { recordType, recordId } = c.req.param();
    const log = await getTransitionLog(recordId, recordType);
    return c.json(log);
  }
);
