import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import type { OrderStatus } from '@prisma/client';

export const ordersRoutes = new Hono();

function formatOrder(order: any) {
  return {
    id: order.id,
    customerId: order.customerId,
    customer: order.customer?.name ?? '',
    orderDate: order.orderDate ?? '',
    quotationNo: order.quotationNo ?? '',
    projectName: order.projectName ?? '',
    projectReference: order.projectReference ?? '',
    siteContactManager: order.siteContactManager ?? '',
    siteContactSupervisor: order.siteContactSupervisor ?? '',
    status: order.status,
    orderValue: order.orderValue ?? 0,
    siteAddress: order.siteAddress ?? '',
    lastUpdatedBy: order.lastUpdatedBy,
    sfclTerms: order.sfclTerms ?? '',
    sfclCreditScore: order.sfclCreditScore ?? '',
    sfclRecommended: order.sfclRecommended ?? '',
    sfclInsured: order.sfclInsured,
    supply: order.supply ?? '',
    customerCollection: order.customerCollection,
    deliveryCharge: order.deliveryCharge ?? '',
    estimatedCollectionDelivery: order.estimatedCollectionDelivery ?? '',
    estimateProjectCompletion: order.estimateProjectCompletion ?? '',
    sfclDelivered: order.sfclDelivered ?? '',
    siteContactManagerNumber: order.siteContactManagerNumber ?? '',
    siteContactSupervisorNumber: order.siteContactSupervisorNumber ?? '',
    siteWorkingHours: order.siteWorkingHours ?? '',
    pending: {
      purchaseOrder: order.pendingPurchaseOrder,
      survey: order.pendingSurvey,
      drawings: order.pendingDrawings,
      drawingsApproved: order.pendingDrawingsApproved,
      depositPaid: order.pendingDepositPaid,
      completed: order.pendingCompleted,
      orderPlaced: order.pendingOrderPlaced,
      shippingDetails: order.pendingShippingDetails,
      invoices: order.pendingInvoices,
      quotationDetails: order.pendingQuotationDetails,
    },
    items: (order.items ?? []).map((item: any) => ({
      id: item.id,
      orderId: item.orderId,
      itemName: item.itemName ?? '',
      reference: item.reference ?? '',
      itemQuantity: item.itemQuantity ?? 0,
      width: item.width ?? 0,
      drop: item.drop ?? 0,
      cost: item.cost ?? 0,
      production: item.production,
      extras: item.extras ?? [],
      productionSpecification: item.productionSpecification ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

const orderInclude = {
  customer: { select: { name: true } },
  items: { orderBy: { createdAt: 'asc' as const } },
};

ordersRoutes.get('/', async (c) => {
  const orders = await prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });

  return c.json(orders.map(formatOrder));
});

ordersRoutes.get('/:id', async (c) => {
  const { id } = c.req.param();

  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });

  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json(formatOrder(order));
});

ordersRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const user = c.get('user');

  const order = await prisma.order.create({
    data: {
      customerId: body.customerId,
      lastUpdatedBy: user.given_name ?? user.email,
      orderDate: body.orderDate || null,
      quotationNo: body.quotationNo || null,
      projectName: body.projectName || null,
      projectReference: body.projectReference || null,
      siteContactManager: body.siteContactManager || null,
      siteContactSupervisor: body.siteContactSupervisor || null,
      status: (body.status as OrderStatus) || 'PENDING',
      orderValue: body.orderValue ?? null,
      siteAddress: body.siteAddress || null,
      sfclTerms: body.sfclTerms || null,
      sfclCreditScore: body.sfclCreditScore || null,
      sfclRecommended: body.sfclRecommended || null,
      sfclInsured: body.sfclInsured ?? false,
      supply: body.supply || null,
      customerCollection: body.customerCollection ?? false,
      deliveryCharge: body.deliveryCharge || null,
      estimatedCollectionDelivery: body.estimatedCollectionDelivery || null,
      estimateProjectCompletion: body.estimateProjectCompletion || null,
      sfclDelivered: body.sfclDelivered || null,
      siteContactManagerNumber: body.siteContactManagerNumber || null,
      siteContactSupervisorNumber: body.siteContactSupervisorNumber || null,
      siteWorkingHours: body.siteWorkingHours || null,
      items: body.items?.length
        ? {
            create: body.items.map((item: any) => ({
              itemName: item.itemName || null,
              reference: item.reference || null,
              itemQuantity: item.itemQuantity ?? null,
              width: item.width ?? null,
              drop: item.drop ?? null,
              cost: item.cost ?? null,
              extras: item.extras ?? [],
            })),
          }
        : undefined,
    },
    include: orderInclude,
  });

  return c.json({ id: order.id, message: 'Order created' }, 201);
});

ordersRoutes.put('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const user = c.get('user');

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: 'Order not found' }, 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: {
        lastUpdatedBy: user.given_name ?? user.email,
        orderDate: body.orderDate ?? existing.orderDate,
        quotationNo: body.quotationNo ?? existing.quotationNo,
        projectName: body.projectName ?? existing.projectName,
        projectReference: body.projectReference ?? existing.projectReference,
        siteContactManager: body.siteContactManager ?? existing.siteContactManager,
        siteContactSupervisor: body.siteContactSupervisor ?? existing.siteContactSupervisor,
        status: body.status ?? existing.status,
        orderValue: body.orderValue ?? existing.orderValue,
        siteAddress: body.siteAddress ?? existing.siteAddress,
        sfclTerms: body.sfclTerms ?? existing.sfclTerms,
        sfclCreditScore: body.sfclCreditScore ?? existing.sfclCreditScore,
        sfclRecommended: body.sfclRecommended ?? existing.sfclRecommended,
        sfclInsured: body.sfclInsured ?? existing.sfclInsured,
        supply: body.supply ?? existing.supply,
        customerCollection: body.customerCollection ?? existing.customerCollection,
        deliveryCharge: body.deliveryCharge ?? existing.deliveryCharge,
        estimatedCollectionDelivery: body.estimatedCollectionDelivery ?? existing.estimatedCollectionDelivery,
        estimateProjectCompletion: body.estimateProjectCompletion ?? existing.estimateProjectCompletion,
        sfclDelivered: body.sfclDelivered ?? existing.sfclDelivered,
        siteContactManagerNumber: body.siteContactManagerNumber ?? existing.siteContactManagerNumber,
        siteContactSupervisorNumber: body.siteContactSupervisorNumber ?? existing.siteContactSupervisorNumber,
        siteWorkingHours: body.siteWorkingHours ?? existing.siteWorkingHours,
      },
    });

    if (body.items) {
      for (const item of body.items) {
        if (item.id) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: {
              itemName: item.itemName,
              reference: item.reference,
              itemQuantity: item.itemQuantity,
              width: item.width,
              drop: item.drop,
              cost: item.cost,
              extras: item.extras ?? [],
              production: item.production,
              productionSpecification: item.productionSpecification ?? undefined,
            },
          });
        } else {
          await tx.orderItem.create({
            data: {
              orderId: id,
              itemName: item.itemName || null,
              reference: item.reference || null,
              itemQuantity: item.itemQuantity ?? null,
              width: item.width ?? null,
              drop: item.drop ?? null,
              cost: item.cost ?? null,
              extras: item.extras ?? [],
            },
          });
        }
      }
    }
  });

  return c.json({ message: 'Order updated' });
});

ordersRoutes.put('/:id/pending', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const user = c.get('user');

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: 'Order not found' }, 404);
  }

  const updateData: any = {
    lastUpdatedBy: user.given_name ?? user.email,
    pendingPurchaseOrder: body.purchaseOrder ?? existing.pendingPurchaseOrder,
    pendingSurvey: body.survey ?? existing.pendingSurvey,
    pendingDrawings: body.drawings ?? existing.pendingDrawings,
    pendingDrawingsApproved: body.drawingsApproved ?? existing.pendingDrawingsApproved,
    pendingDepositPaid: body.depositPaid ?? existing.pendingDepositPaid,
    pendingCompleted: body.completed ?? existing.pendingCompleted,
    pendingOrderPlaced: body.orderPlaced ?? existing.pendingOrderPlaced,
    pendingShippingDetails: body.shippingDetails ?? existing.pendingShippingDetails,
    pendingInvoices: body.invoices ?? existing.pendingInvoices,
    pendingQuotationDetails: body.quotationDetails ?? existing.pendingQuotationDetails,
  };

  if (body.completed) {
    updateData.status = 'PRODUCTION_SPECIFICATION';
  }

  await prisma.order.update({ where: { id }, data: updateData });

  return c.json({ message: 'Pending status updated' });
});

ordersRoutes.put('/:id/items/:itemId', async (c) => {
  const { itemId } = c.req.param();
  const body = await c.req.json();

  const existing = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!existing) {
    return c.json({ error: 'Order item not found' }, 404);
  }

  await prisma.orderItem.update({
    where: { id: itemId },
    data: {
      itemName: body.itemName ?? existing.itemName,
      reference: body.reference ?? existing.reference,
      itemQuantity: body.itemQuantity ?? existing.itemQuantity,
      width: body.width ?? existing.width,
      drop: body.drop ?? existing.drop,
      cost: body.cost ?? existing.cost,
      production: body.production ?? existing.production,
      extras: body.extras ?? existing.extras,
      productionSpecification: body.productionSpecification ?? existing.productionSpecification,
    },
  });

  return c.json({ message: 'Item updated' });
});

ordersRoutes.put('/:id/items/:itemId/production', async (c) => {
  const { itemId } = c.req.param();
  const body = await c.req.json();

  await prisma.orderItem.update({
    where: { id: itemId },
    data: {
      production: body.production ?? true,
      productionSpecification: body.productionSpecification ?? undefined,
    },
  });

  return c.json({ message: 'Production status updated' });
});

ordersRoutes.delete('/:id/items/:itemId', async (c) => {
  const { itemId } = c.req.param();

  await prisma.orderItem.delete({ where: { id: itemId } });
  return c.json({ message: 'Item deleted' });
});
