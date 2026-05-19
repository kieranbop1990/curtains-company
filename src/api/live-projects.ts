import { apiClient } from './client';
import type { LiveProject, LQRoutingDecision } from 'src/types/live-project';

export const liveProjectsApi = {
  async getAll(params?: { stage?: string; search?: string }): Promise<LiveProject[]> {
    const qs = new URLSearchParams();
    if (params?.stage) qs.set('stage', params.stage);
    if (params?.search) qs.set('search', params.search);
    const q = qs.toString();
    return apiClient.get<LiveProject[]>(`/api/live-projects${q ? `?${q}` : ''}`);
  },

  async get(id: string): Promise<LiveProject> {
    return apiClient.get<LiveProject>(`/api/live-projects/${id}`);
  },

  async create(data: Partial<LiveProject>): Promise<LiveProject> {
    return apiClient.post<LiveProject>('/api/live-projects', data);
  },

  async update(id: string, data: Partial<LiveProject>): Promise<LiveProject> {
    return apiClient.patch<LiveProject>(`/api/live-projects/${id}`, data);
  },

  async advanceToStage3(id: string): Promise<LiveProject> {
    return apiClient.post<LiveProject>(`/api/live-projects/${id}/advance-to-stage3`);
  },

  async route(id: string, decision: LQRoutingDecision): Promise<LiveProject> {
    return apiClient.post<LiveProject>(`/api/live-projects/${id}/route`, { decision });
  },

  async addInvoice(id: string, inv: { invoiceNumber: string; amount: number; status?: string; dueDate?: string }) {
    return apiClient.post(`/api/live-projects/${id}/invoices`, inv);
  },

  async updateInvoice(id: string, invId: string, data: any) {
    return apiClient.patch(`/api/live-projects/${id}/invoices/${invId}`, data);
  },

  async deleteInvoice(id: string, invId: string) {
    return apiClient.del(`/api/live-projects/${id}/invoices/${invId}`);
  },

  async syncXeroInvoices(id: string) {
    return apiClient.post(`/api/live-projects/${id}/invoices/xero-sync`);
  },

  async addDrawing(id: string, d: { drawingNumber: string; description?: string }) {
    return apiClient.post(`/api/live-projects/${id}/drawings`, d);
  },

  async updateDrawing(id: string, drawingId: string, data: any) {
    return apiClient.patch(`/api/live-projects/${id}/drawings/${drawingId}`, data);
  },

  async deleteDrawing(id: string, drawingId: string) {
    return apiClient.del(`/api/live-projects/${id}/drawings/${drawingId}`);
  },

  async addInstallationItem(id: string, item: any) {
    return apiClient.post(`/api/live-projects/${id}/installation-items`, item);
  },

  async updateInstallationItem(id: string, itemId: string, data: any) {
    return apiClient.patch(`/api/live-projects/${id}/installation-items/${itemId}`, data);
  },

  async deleteInstallationItem(id: string, itemId: string) {
    return apiClient.del(`/api/live-projects/${id}/installation-items/${itemId}`);
  },

  async addComponent(id: string, comp: { componentName: string; qty?: number; stockStatus?: string; cost?: number }) {
    return apiClient.post(`/api/live-projects/${id}/components`, comp);
  },

  async updateComponent(id: string, compId: string, data: any) {
    return apiClient.patch(`/api/live-projects/${id}/components/${compId}`, data);
  },

  async deleteComponent(id: string, compId: string) {
    return apiClient.del(`/api/live-projects/${id}/components/${compId}`);
  },
};
