import { apiClient } from './client';
import Auth from '@aws-amplify/auth';
import type { ProductionPack, ProductionSystem, ManufacturingJob, MfgStatus } from 'src/types/production-pack';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const productionPackApi = {
  async getAll(params?: { liveProjectId?: string; liveServiceId?: string }): Promise<ProductionPack[]> {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as any).toString() : '';
    return apiClient.get<ProductionPack[]>(`/api/production-packs${qs}`);
  },
  async get(id: string): Promise<ProductionPack> {
    return apiClient.get<ProductionPack>(`/api/production-packs/${id}`);
  },
  async create(data: { liveProjectId?: string; liveServiceId?: string }): Promise<ProductionPack> {
    return apiClient.post<ProductionPack>('/api/production-packs', data);
  },
  async update(id: string, data: Partial<ProductionPack>): Promise<ProductionPack> {
    return apiClient.patch<ProductionPack>(`/api/production-packs/${id}`, data);
  },
  async addSystem(packId: string, data: Partial<ProductionSystem>): Promise<ProductionSystem> {
    return apiClient.post<ProductionSystem>(`/api/production-packs/${packId}/systems`, data);
  },
  async updateSystem(packId: string, systemId: string, data: Partial<ProductionSystem>): Promise<ProductionSystem> {
    return apiClient.patch<ProductionSystem>(`/api/production-packs/${packId}/systems/${systemId}`, data);
  },
  async deleteSystem(packId: string, systemId: string): Promise<void> {
    return apiClient.del(`/api/production-packs/${packId}/systems/${systemId}`);
  },
  async sendToStage5(packId: string): Promise<ManufacturingJob> {
    return apiClient.post<ManufacturingJob>(`/api/production-packs/${packId}/send-to-stage5`);
  },
  async downloadSystemPdf(packId: string, systemId: string, docType: string, filename: string): Promise<void> {
    let token = '';
    try { const s = await Auth.currentSession(); token = s.getIdToken().getJwtToken(); } catch {}
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/api/production-packs/${packId}/systems/${systemId}/pdf/${docType}`, { headers });
    if (!response.ok) throw new Error('PDF download failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
};

export const manufacturingApi = {
  async getAll(): Promise<ManufacturingJob[]> {
    return apiClient.get<ManufacturingJob[]>('/api/manufacturing-jobs');
  },
  async get(id: string): Promise<ManufacturingJob> {
    return apiClient.get<ManufacturingJob>(`/api/manufacturing-jobs/${id}`);
  },
  async update(id: string, data: Partial<ManufacturingJob>): Promise<ManufacturingJob> {
    return apiClient.patch<ManufacturingJob>(`/api/manufacturing-jobs/${id}`, data);
  },
  async advanceStatus(id: string, targetStatus: MfgStatus): Promise<ManufacturingJob> {
    return apiClient.post<ManufacturingJob>(`/api/manufacturing-jobs/${id}/advance-status`, { targetStatus });
  },
  async updateQcCheckpoint(jobId: string, checkpointId: string, checked: boolean): Promise<ManufacturingJob> {
    return apiClient.patch<ManufacturingJob>(`/api/manufacturing-jobs/${jobId}/qc-checkpoints/${checkpointId}`, { checked });
  },
  async addComponent(jobId: string, data: any): Promise<any> {
    return apiClient.post(`/api/manufacturing-jobs/${jobId}/components`, data);
  },
  async updateComponent(jobId: string, componentId: string, data: any): Promise<any> {
    return apiClient.patch(`/api/manufacturing-jobs/${jobId}/components/${componentId}`, data);
  },
};
