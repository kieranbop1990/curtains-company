import type {Customer} from 'src/types/customer';
import { applyPagination } from 'src/utils/apply-pagination';
import { applySort } from 'src/utils/apply-sort';
import {fetchCustomers} from "./calls";

type GetCustomersRequest = {
    filters?: {
        query?: string;
        trustedPayer?: boolean;
    };
    page?: number;
    rowsPerPage?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
};

type GetCustomersResponse = Promise<{
    data: Customer[];
    count: number;
}>;

type GetCustomerRequest = {
    id: string;
};

type GetCustomerResponse = Promise<Customer>;


class CustomersApi {
    _data: Customer[] | null = null;

    refresh(): void {
        this._data = null;
    }

    async _fetchData(): Promise<Customer[]> {
        if (!this._data) {
            this._data = await fetchCustomers();
        }
        return this._data;
    }

    async getCustomers(request: GetCustomersRequest = {}): GetCustomersResponse {
        let data = await this._fetchData();
        let count = data.length;

        const { filters, page, rowsPerPage, sortBy, sortDir } = request;

        if (filters) {
            data = data.filter((customer: Customer) => {
                if (filters.query) {
                    let queryMatched = false;
                    const properties: ('email' | 'customer')[] = ['email', 'customer'];

                    properties.forEach((property) => {
                        const propValue = customer[property];
                        if (propValue && propValue.toLowerCase().includes(filters.query!.toLowerCase())) {
                            queryMatched = true;
                        }
                    });

                    if (!queryMatched) {
                        return false;
                    }
                }

                if (typeof filters.trustedPayer !== 'undefined') {
                    if (customer.trustedPayer !== filters.trustedPayer) {
                        return false;
                    }
                }

                return true;
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
            count
        };
    }


    async getCustomer(request: GetCustomerRequest): GetCustomerResponse {
        const {id} = request;
        const data = await this._fetchData();
        const foundCustomer = data.find(customer => customer.id === id);

        if (foundCustomer) {
            return foundCustomer;
        } else {
            return Promise.reject(new Error('Customer not found'));
        }
    }
}

export const customersApi = new CustomersApi();
