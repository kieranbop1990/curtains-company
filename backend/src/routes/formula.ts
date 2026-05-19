import { Hono } from 'hono';
import { requireRole } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const formulaRoutes = new Hono();

const FORMULA_PIN = process.env.FORMULA_PIN || '1234';

// POST /api/formula/verify-pin — verify PIN and return a short-lived session token
formulaRoutes.post('/verify-pin', requireRole('ADMIN'), async (c) => {
  const { pin } = await c.req.json<{ pin: string }>();
  if (pin !== FORMULA_PIN) {
    return c.json({ error: 'Incorrect PIN' }, 403);
  }
  // Log the PIN verification attempt
  const user = c.get('user');
  await prisma.stageTransitionLog.create({
    data: {
      recordId: 'formula-templates',
      recordType: 'FormulaAccess',
      actorId: user.sub,
      actorName: `${user.given_name ?? ''} ${user.family_name ?? ''}`.trim() || user.email,
      fromStage: 'LOCKED',
      toStage: 'UNLOCKED',
      transitionMethod: 'ADMIN_OVERRIDE',
      overrideReason: 'Formula PIN verified',
    },
  });
  return c.json({ unlocked: true });
});

// POST /api/formula/log-edit — audit log a formula edit (call after saving formula)
formulaRoutes.post('/log-edit', requireRole('ADMIN'), async (c) => {
  const { templateId, description } = await c.req.json<{ templateId: string; description: string }>();
  const user = c.get('user');
  await prisma.stageTransitionLog.create({
    data: {
      recordId: templateId,
      recordType: 'FormulaTemplate',
      actorId: user.sub,
      actorName: `${user.given_name ?? ''} ${user.family_name ?? ''}`.trim() || user.email,
      fromStage: 'EDIT',
      toStage: 'SAVED',
      transitionMethod: 'ADMIN_OVERRIDE',
      overrideReason: description,
    },
  });
  return c.json({ logged: true });
});
