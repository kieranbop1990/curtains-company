import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';

export const dashboardRoutes = new Hono();

dashboardRoutes.get('/stats', async (c) => {
  const [totalCustomers, totalOrders, totalProductionOrders] = await Promise.all([
    prisma.customer.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PRODUCTION_READY' } }),
  ]);

  return c.json({
    totalCustomers,
    totalOrders,
    totalProductionOrders,
  });
});
