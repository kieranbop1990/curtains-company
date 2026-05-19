import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';

export const customersRoutes = new Hono();

customersRoutes.get('/', async (c) => {
  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        select: { id: true, orderValue: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = customers.map((customer) => ({
    id: customer.id,
    customer: customer.name,
    businessName: customer.businessName ?? '',
    email: customer.email ?? '',
    contactNum: customer.contactNum ?? '',
    accountsContact: customer.accountsContact ?? '',
    regNumber: customer.regNumber ?? '',
    trustedPayer: customer.trustedPayer,
    creditLimit: customer.creditLimit,
    billingAddress: customer.billingAddress ?? '',
    accountsEmail: customer.accountsEmail ?? '',
    vatNumber: customer.vatNumber ?? '',
    taxReference: customer.taxReference ?? '',
    vatExempt: customer.vatExempt,
    vatReverse: customer.vatReverse,
    cisDeductions: customer.cisDeductions,
    cisName: customer.cisName ?? '',
    cisRate: customer.cisRate ?? '',
    cisOrgType: customer.cisOrgType ?? '',
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    totalOrders: customer.orders.length,
    totalSpent: customer.orders.reduce((sum, o) => sum + (o.orderValue ?? 0), 0),
  }));

  return c.json(result);
});

customersRoutes.get('/:id', async (c) => {
  const { id } = c.req.param();

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        select: { id: true, orderValue: true, status: true, projectName: true, orderDate: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) {
    return c.json({ error: 'Customer not found' }, 404);
  }

  return c.json({
    id: customer.id,
    customer: customer.name,
    businessName: customer.businessName ?? '',
    email: customer.email ?? '',
    contactNum: customer.contactNum ?? '',
    accountsContact: customer.accountsContact ?? '',
    regNumber: customer.regNumber ?? '',
    trustedPayer: customer.trustedPayer,
    creditLimit: customer.creditLimit,
    billingAddress: customer.billingAddress ?? '',
    accountsEmail: customer.accountsEmail ?? '',
    vatNumber: customer.vatNumber ?? '',
    taxReference: customer.taxReference ?? '',
    vatExempt: customer.vatExempt,
    vatReverse: customer.vatReverse,
    cisDeductions: customer.cisDeductions,
    cisName: customer.cisName ?? '',
    cisRate: customer.cisRate ?? '',
    cisOrgType: customer.cisOrgType ?? '',
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    totalOrders: customer.orders.length,
    totalSpent: customer.orders.reduce((sum, o) => sum + (o.orderValue ?? 0), 0),
    orders: customer.orders,
  });
});

customersRoutes.post('/', async (c) => {
  const body = await c.req.json();

  const customer = await prisma.customer.create({
    data: {
      name: body.customer,
      businessName: body.businessName || null,
      email: body.email || null,
      contactNum: body.contactNum || null,
      accountsContact: body.accountsContact || null,
      regNumber: body.regNumber || null,
      trustedPayer: body.trustedPayer ?? false,
      creditLimit: body.creditLimit ?? 0,
      billingAddress: body.billingAddress || null,
      accountsEmail: body.accountsEmail || null,
      vatNumber: body.vatNumber || null,
      taxReference: body.taxReference || null,
      vatExempt: body.vatExempt ?? false,
      vatReverse: body.vatReverse ?? false,
      cisDeductions: body.cisDeductions ?? false,
      cisName: body.cisName || null,
      cisRate: body.cisRate || null,
      cisOrgType: body.cisOrgType || null,
    },
  });

  return c.json({ id: customer.id, message: 'Customer created' }, 201);
});

customersRoutes.put('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: 'Customer not found' }, 404);
  }

  await prisma.customer.update({
    where: { id },
    data: {
      name: body.customer ?? existing.name,
      businessName: body.businessName ?? existing.businessName,
      email: body.email ?? existing.email,
      contactNum: body.contactNum ?? existing.contactNum,
      accountsContact: body.accountsContact ?? existing.accountsContact,
      regNumber: body.regNumber ?? existing.regNumber,
      trustedPayer: body.trustedPayer ?? existing.trustedPayer,
      creditLimit: body.creditLimit ?? existing.creditLimit,
      billingAddress: body.billingAddress ?? existing.billingAddress,
      accountsEmail: body.accountsEmail ?? existing.accountsEmail,
      vatNumber: body.vatNumber ?? existing.vatNumber,
      taxReference: body.taxReference ?? existing.taxReference,
      vatExempt: body.vatExempt ?? existing.vatExempt,
      vatReverse: body.vatReverse ?? existing.vatReverse,
      cisDeductions: body.cisDeductions ?? existing.cisDeductions,
      cisName: body.cisName ?? existing.cisName,
      cisRate: body.cisRate ?? existing.cisRate,
      cisOrgType: body.cisOrgType ?? existing.cisOrgType,
    },
  });

  return c.json({ message: 'Customer updated' });
});

customersRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param();

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: 'Customer not found' }, 404);
  }

  await prisma.customer.delete({ where: { id } });
  return c.json({ message: 'Customer deleted' });
});
