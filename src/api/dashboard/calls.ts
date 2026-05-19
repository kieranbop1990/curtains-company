import { apiClient } from '../client';

export type FetchOrdersResult = {
  totalCustomers: number;
  totalOrders: number;
  totalProductionOrders: number;
};

export const fetchDashboardData = async (): Promise<FetchOrdersResult> => {
  try {
    return await apiClient.get<FetchOrdersResult>('/api/dashboard/stats');
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      totalCustomers: 0,
      totalOrders: 0,
      totalProductionOrders: 0,
    };
  }
};
