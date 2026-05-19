import { apiClient } from './client';
import type { ServiceQuote, LiveService, ServiceQuoteStatus } from 'src/types/service-operations';

export const serviceQuotesApi = {
  async getAll(): Promise<ServiceQuote[]> {
    return apiClient.get<ServiceQuote[]>('/api/service-quotes');
  },
  async get(id: string): Promise<ServiceQuote> {
    return apiClient.get<ServiceQuote>(`/api/service-quotes/${id}`);
  },
  async create(data: { customerName: string; assetId?: string; assetRef?: string }): Promise<ServiceQuote> {
    return apiClient.post<ServiceQuote>('/api/service-quotes', data);
  },
  async update(id: string, data: Partial<ServiceQuote>): Promise<ServiceQuote> {
    return apiClient.patch<ServiceQuote>(`/api/service-quotes/${id}`, data);
  },
  async advanceStatus(id: string, targetStatus: ServiceQuoteStatus): Promise<ServiceQuote> {
    return apiClient.post<ServiceQuote>(`/api/service-quotes/${id}/advance-status`, { targetStatus });
  },
  async convertToLs(id: string): Promise<{ liveServiceId: string; lsRef: string }> {
    return apiClient.post(`/api/service-quotes/${id}/convert-to-ls`);
  },
  async addChaseEntry(id: string, entry: { chaseDate: string; chasedBy: string; method?: string; outcome?: string; nextActionDate?: string }) {
    return apiClient.post(`/api/service-quotes/${id}/chase-entries`, entry);
  },
  async deleteChaseEntry(id: string, entryId: string) {
    return apiClient.del(`/api/service-quotes/${id}/chase-entries/${entryId}`);
  },
};

export const liveServicesApi = {
  async getAll(): Promise<LiveService[]> {
    return apiClient.get<LiveService[]>('/api/live-services');
  },
  async get(id: string): Promise<LiveService> {
    return apiClient.get<LiveService>(`/api/live-services/${id}`);
  },
  async update(id: string, data: Partial<LiveService>): Promise<LiveService> {
    return apiClient.patch<LiveService>(`/api/live-services/${id}`, data);
  },
};
