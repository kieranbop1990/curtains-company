import { apiClient } from '../client';
import { applyPagination } from 'src/utils/apply-pagination';
import { applySort } from 'src/utils/apply-sort';
import type { UploadedItem } from 'src/types/file-manager';

type GetItemsRequest = {
  filters?: {
    query?: string;
  };
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

type GetItemsResponse = Promise<{
  data: UploadedItem[];
  count: number;
}>;

class FileManagerApi {
  async getItems(
    request: GetItemsRequest = {},
    orderId: string | undefined,
    _customer: string | undefined,
  ): GetItemsResponse {
    const { filters, page, rowsPerPage, sortBy, sortDir } = request;

    let data: UploadedItem[] = [];

    if (orderId) {
      data = await apiClient.get<UploadedItem[]>(`/api/files/${orderId}`);
    }

    let count = data.length;

    if (filters?.query) {
      data = data.filter((file) =>
        file.id?.toLowerCase().includes(filters.query!.toLowerCase()),
      );
      count = data.length;
    }

    if (sortBy && sortDir) {
      data = applySort(data, sortBy, sortDir);
    }

    if (page !== undefined && rowsPerPage !== undefined) {
      data = applyPagination(data, page, rowsPerPage);
    }

    return { data, count };
  }
}

export const fileManagerApi = new FileManagerApi();

export async function getUploadUrl(key: string, contentType: string): Promise<string> {
  const response = await apiClient.post<{ url: string }>('/api/files/upload-url', {
    key,
    contentType,
  });
  return response.url;
}

export async function getDownloadUrl(key: string): Promise<string> {
  const response = await apiClient.post<{ url: string }>('/api/files/download-url', { key });
  return response.url;
}

export async function listFiles(orderId: string, subfolder?: string): Promise<UploadedItem[]> {
  const path = subfolder
    ? `/api/files/${orderId}?prefix=${subfolder}`
    : `/api/files/${orderId}`;
  return apiClient.get<UploadedItem[]>(path);
}
