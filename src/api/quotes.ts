import { apiClient } from './client';
import type { Quote, QuoteListResponse } from 'src/types/quote';

export const quotesApi = {
  async getQuotes(params?: { status?: string; source?: string; search?: string }): Promise<QuoteListResponse> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.source) qs.set('source', params.source);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return apiClient.get<QuoteListResponse>(`/api/quotes${query ? `?${query}` : ''}`);
  },

  async getQuote(id: string): Promise<Quote> {
    return apiClient.get<Quote>(`/api/quotes/${id}`);
  },

  async createQuote(data: Partial<Quote>): Promise<Quote> {
    return apiClient.post<Quote>('/api/quotes', data);
  },

  async updateQuote(id: string, data: Partial<Quote>): Promise<Quote> {
    return apiClient.patch<Quote>(`/api/quotes/${id}`, data);
  },

  async convertToLq(id: string): Promise<{ liveProjectId: string; lqRef: string }> {
    return apiClient.post(`/api/quotes/${id}/convert-to-lq`);
  },

  async addChaseEntry(id: string, entry: { chaseDate: string; chasedBy: string; method?: string; outcome?: string; nextActionDate?: string }) {
    return apiClient.post(`/api/quotes/${id}/chase-entries`, entry);
  },

  async deleteChaseEntry(id: string, entryId: string) {
    return apiClient.del(`/api/quotes/${id}/chase-entries/${entryId}`);
  },
};
