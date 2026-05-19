import { apiClient } from '../client';
import type { Order, OrderInformation } from 'src/types/order';
import type { User } from 'src/types/user';
import { ordersApi } from './index';

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    return await apiClient.get<Order[]>('/api/orders');
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const updateOrder = async (order: Order, values: any, _user: User | null): Promise<string> => {
  try {
    await apiClient.put(`/api/orders/${order.id}`, {
      orderDate: values.orderDate,
      orderValue: values.orderValue,
      siteAddress: values.siteAddress,
      projectName: values.projectName,
      projectReference: values.projectReference,
      quotationNo: values.quotationNo,
      siteContactManager: values.siteContactManager,
      siteContactSupervisor: values.siteContactSupervisor,
      status: 'PENDING',
      sfclTerms: values.sfclTerms,
      sfclCreditScore: values.sfclCreditScore,
      sfclRecommended: values.sfclRecommended,
      sfclInsured: values.sfclInsured,
      supply: values.supply,
      customerCollection: values.customerCollection,
      deliveryCharge: values.deliveryCharge,
      estimatedCollectionDelivery: values.estimatedCollectionDelivery,
      estimateProjectCompletion: values.estimateProjectCompletion,
      sfclDelivered: values.sfclDelivered,
      siteContactManagerNumber: values.siteContactManagerNumber,
      siteContactSupervisorNumber: values.siteContactSupervisorNumber,
      siteWorkingHours: values.siteWorkingHours,
      items: values.items.map((item: any) => ({
        id: item.id || undefined,
        itemName: item.itemName,
        reference: item.reference,
        itemQuantity: item.itemQuantity,
        width: item.width,
        drop: item.drop,
        cost: item.cost,
        extras: item.extras,
      })),
    });

    ordersApi.refresh();
    return 'Order updated';
  } catch (error) {
    console.error('Failed to update order:', error);
    throw error;
  }
};

export const createOrder = async (values: any, _user: User | null): Promise<string> => {
  try {
    const response = await apiClient.post<{ id: string }>('/api/orders', {
      customerId: values.onboardedCustomers,
      orderDate: values.orderDate,
      orderValue: values.orderValue,
      siteAddress: values.siteAddress,
      projectName: values.projectName,
      projectReference: values.projectReference,
      quotationNo: values.quotationNo,
      siteContactManager: values.siteContactManager,
      siteContactSupervisor: values.siteContactSupervisor,
      status: values.status || 'PENDING',
      sfclTerms: values.sfclTerms,
      sfclCreditScore: values.sfclCreditScore,
      sfclRecommended: values.sfclRecommended,
      sfclInsured: values.sfclInsured,
      supply: values.supply,
      customerCollection: values.customerCollection,
      deliveryCharge: values.deliveryCharge,
      estimatedCollectionDelivery: values.estimatedCollectionDelivery,
      estimateProjectCompletion: values.estimateProjectCompletion,
      sfclDelivered: values.sfclDelivered,
      siteContactManagerNumber: values.siteContactManagerNumber,
      siteContactSupervisorNumber: values.siteContactSupervisorNumber,
      siteWorkingHours: values.siteWorkingHours,
      items: values.items.map((item: any) => ({
        itemName: item.itemName,
        reference: item.reference,
        itemQuantity: item.itemQuantity,
        width: item.width,
        drop: item.drop,
        cost: item.cost,
        extras: item.extras,
      })),
    });

    ordersApi.refresh();
    return response.id;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};

export const updatePendingStatus = async (
  orderId: string,
  values: any,
): Promise<string> => {
  await apiClient.put(`/api/orders/${orderId}/pending`, {
    purchaseOrder: values.purchaseOrder,
    survey: values.surveys,
    drawings: values.drawings,
    shippingDetails: values.shipping,
    invoices: values.invoices,
    quotationDetails: values.quotation,
    depositPaid: values.deposit,
    orderPlaced: values.orderPlaced,
    drawingsApproved: values.drawingsApproved,
    completed: values.completed,
  });

  ordersApi.refresh();
  return 'Completed';
};

export const updateOrderItemProduction = async (
  orderId: string,
  item: OrderInformation,
): Promise<string> => {
  await apiClient.put(`/api/orders/${orderId}/items/${item.id}/production`, {
    production: true,
    productionSpecification: item.productionSpecification,
  });
  return 'Completed';
};

export const updateProductionStatus = async (
  orderId: string,
  item: OrderInformation,
): Promise<string> => {
  await apiClient.put(`/api/orders/${orderId}/items/${item.id}`, {
    production: false,
  });
  return 'Completed';
};
