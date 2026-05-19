import { apiClient } from './client';
import type { Asset } from 'src/types/asset';

export const assetsApi = {
  async getAssets(params?: { status?: string; priority?: string; search?: string }): Promise<Asset[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.priority) qs.set('priority', params.priority);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return apiClient.get<Asset[]>(`/api/assets${query ? `?${query}` : ''}`);
  },

  async getAsset(id: string): Promise<Asset> {
    return apiClient.get<Asset>(`/api/assets/${id}`);
  },

  async createAsset(data: Partial<Asset>): Promise<Asset> {
    return apiClient.post<Asset>('/api/assets', data);
  },

  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    return apiClient.patch<Asset>(`/api/assets/${id}`, data);
  },

  async addContact(assetId: string, contact: { name: string; phone?: string; email?: string }) {
    return apiClient.post(`/api/assets/${assetId}/contacts`, contact);
  },

  async deleteContact(assetId: string, contactId: string) {
    return apiClient.del(`/api/assets/${assetId}/contacts/${contactId}`);
  },

  async addServiceEvent(assetId: string, event: {
    serviceDate: string; engineerName?: string; company?: string;
    summary?: string; statusLabel?: string;
  }) {
    return apiClient.post(`/api/assets/${assetId}/service-events`, event);
  },

  async getLinkedAssets(assetId: string): Promise<Asset[]> {
    return apiClient.get<Asset[]>(`/api/assets/${assetId}/linked`);
  },

  async getDocumentUploadUrl(assetId: string, docType: string, contentType?: string): Promise<{ url: string; fileName: string }> {
    return apiClient.post(`/api/assets/${assetId}/documents/upload-url`, { docType, contentType });
  },

  async getDocumentDownloadUrl(assetId: string, docType: string): Promise<{ url: string }> {
    return apiClient.get(`/api/assets/${assetId}/documents/download-url?docType=${encodeURIComponent(docType)}`);
  },

  async downloadPdf(assetId: string): Promise<void> {
    const { url } = await this.getDocumentDownloadUrl(assetId, 'pdf');
    window.open(`/api/assets/${assetId}/pdf`, '_blank');
  },
};
