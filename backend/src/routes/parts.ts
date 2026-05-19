import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';

export const partsRoutes = new Hono();

async function generatePartRef(): Promise<string> {
  const count = await prisma.part.count();
  return `P-${String(count + 1).padStart(4, '0')}`;
}

partsRoutes.get('/', requireRole('ADMIN', 'OFFICE_OPERATIONS', 'ENGINEER_FIELD', 'FINANCE_ACCOUNTS', 'PRODUCTION'), async (c) => {
  const activeOnly = c.req.query('active') !== 'false';
  const category = c.req.query('category');
  const parts = await prisma.part.findMany({
    where: {
      ...(activeOnly ? { active: true } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
  return c.json(parts);
});

partsRoutes.post('/', requireRole('ADMIN', 'OFFICE_OPERATIONS', 'PRODUCTION'), async (c) => {
  const body = await c.req.json();
  const partRef = await generatePartRef();
  const part = await prisma.part.create({
    data: {
      partRef,
      name: body.name,
      category: body.category,
      description: body.description ?? null,
      unitCost: body.unitCost != null ? Number(body.unitCost) : null,
      unit: body.unit ?? null,
      supplier: body.supplier ?? null,
      active: body.active ?? true,
    },
  });
  return c.json(part, 201);
});

partsRoutes.patch('/:id', requireRole('ADMIN', 'OFFICE_OPERATIONS', 'PRODUCTION'), async (c) => {
  const body = await c.req.json();
  const data: Record<string, unknown> = { ...body };
  if (body.unitCost != null) data.unitCost = Number(body.unitCost);
  const part = await prisma.part.update({
    where: { id: c.req.param('id') },
    data,
  });
  return c.json(part);
});

partsRoutes.delete('/:id', requireRole('ADMIN', 'OFFICE_OPERATIONS', 'PRODUCTION'), async (c) => {
  await prisma.part.update({
    where: { id: c.req.param('id') },
    data: { active: false },
  });
  return c.json({ ok: true });
});
