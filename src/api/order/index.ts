import type { OrderStatus } from 'src/types/order';
import type { Order } from 'src/types/order';
import { applyPagination } from 'src/utils/apply-pagination';
import { applySort } from 'src/utils/apply-sort';
import { fetchOrders } from './calls';

type GetOrdersRequest = {
  filters?: {
    query?: string;
    status?: OrderStatus;
  };
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

type GetOrdersResponse = Promise<{
  data: Order[];
  count: number;
}>;

type GetOrderRequest = {
  id: string;
};

class OrdersApi {
  _data: Order[] | null = null;

  refresh(): void {
    this._data = null;
  }

  async _fetchData(): Promise<Order[]> {
    if (!this._data) {
      this._data = await fetchOrders();
    }
    return this._data;
  }

  async getOrders(request: GetOrdersRequest = {}): GetOrdersResponse {
    const { filters, page, rowsPerPage, sortBy, sortDir } = request;

    let data = await this._fetchData();
    let count = data.length;

    if (typeof filters !== 'undefined') {
      data = data.filter((order: Order) => {
        if (filters.query) {
          let queryMatched = false;
          const properties: ('customer' | 'projectName' | 'projectReference')[] = [
            'customer',
            'projectName',
            'projectReference',
          ];

          properties.forEach((property) => {
            if (order[property]?.toLowerCase().includes(filters.query!.toLowerCase())) {
              queryMatched = true;
            }
          });

          if (!queryMatched) {
            return false;
          }
        }

        return !(filters.status && order.status !== filters.status);
      });
      count = data.length;
    }

    if (sortBy && sortDir) {
      data = applySort(data, sortBy, sortDir);
    }

    if (page !== undefined && rowsPerPage !== undefined) {
      data = applyPagination(data, page, rowsPerPage);
    }

    return {
      data,
      count,
    };
  }

  async getOrder(request: GetOrderRequest): Promise<Order> {
    const { id } = request;
    const data = await this._fetchData();
    const foundOrder = data.find((order) => order.id === id);

    if (foundOrder) {
      return foundOrder;
    } else {
      return Promise.reject(new Error('Order not found'));
    }
  }
}

export const ordersApi = new OrdersApi();
