import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';

export const staffRoutes = new Hono();

staffRoutes.get('/', requireRole('ADMIN', 'OFFICE_OPERATIONS', 'ENGINEER_FIELD', 'FINANCE_ACCOUNTS', 'PRODUCTION'), async (c) => {
  const activeOnly = c.req.query('active') !== 'false';
  const staff = await prisma.staffMember.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: 'asc' },
  });
  return c.json(staff);
});

staffRoutes.post('/', requireRole('ADMIN', 'OFFICE_OPERATIONS'), async (c) => {
  const body = await c.req.json();
  const member = await prisma.staffMember.create({
    data: {
      name: body.name,
      role: body.role,
      email: body.email ?? null,
      phone: body.phone ?? null,
      active: body.active ?? true,
    },
  });
  return c.json(member, 201);
});

staffRoutes.patch('/:id', requireRole('ADMIN', 'OFFICE_OPERATIONS'), async (c) => {
  const body = await c.req.json();
  const member = await prisma.staffMember.update({
    where: { id: c.req.param('id') },
    data: body,
  });
  return c.json(member);
});

staffRoutes.delete('/:id', requireRole('ADMIN', 'OFFICE_OPERATIONS'), async (c) => {
  await prisma.staffMember.update({
    where: { id: c.req.param('id') },
    data: { active: false },
  });
  return c.json({ ok: true });
});
