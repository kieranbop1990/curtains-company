import { apiClient } from './client';
import { userManager } from 'src/lib/user-manager';
import type { DistributionJob, DistributionType } from 'src/types/distribution';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function downloadPdfPost(path: string, filename: string): Promise<void> {
  const user = await userManager.getUser().catch(() => null);
  const token = user?.id_token ?? '';
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`PDF request failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export const distributionApi = {
  async getAll(params?: { mfgJobId?: string; liveProjectId?: string; liveServiceId?: string }): Promise<DistributionJob[]> {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as any).toString() : '';
    return apiClient.get<DistributionJob[]>(`/api/distribution-jobs${qs}`);
  },
  async get(id: string): Promise<DistributionJob> {
    return apiClient.get<DistributionJob>(`/api/distribution-jobs/${id}`);
  },
  async create(data: { distributionType: DistributionType; mfgJobId?: string; liveProjectId?: string; liveServiceId?: string; customerName?: string; siteName?: string }): Promise<DistributionJob> {
    return apiClient.post<DistributionJob>('/api/distribution-jobs', data);
  },
  async update(id: string, data: Partial<DistributionJob>): Promise<DistributionJob> {
    return apiClient.patch<DistributionJob>(`/api/distribution-jobs/${id}`, data);
  },
  async approveRelease(id: string, approvedBy: string): Promise<DistributionJob> {
    return apiClient.post<DistributionJob>(`/api/distribution-jobs/${id}/approve-release`, { approvedBy });
  },
  async releaseCertificates(id: string, reason?: string): Promise<DistributionJob> {
    return apiClient.post<DistributionJob>(`/api/distribution-jobs/${id}/release-certificates`, { reason });
  },
  async addEngineer(djId: string, data: { engineerName: string; engineerId?: string }): Promise<any> {
    return apiClient.post(`/api/distribution-jobs/${djId}/engineers`, data);
  },
  async updateEngineer(djId: string, engId: string, data: any): Promise<any> {
    return apiClient.patch(`/api/distribution-jobs/${djId}/engineers/${engId}`, data);
  },
  async deleteEngineer(djId: string, engId: string): Promise<void> {
    return apiClient.del(`/api/distribution-jobs/${djId}/engineers/${engId}`);
  },
  async addMilestone(djId: string, data: any): Promise<any> {
    return apiClient.post(`/api/distribution-jobs/${djId}/milestones`, data);
  },
  async updateMilestone(djId: string, milestoneId: string, data: any): Promise<any> {
    return apiClient.patch(`/api/distribution-jobs/${djId}/milestones/${milestoneId}`, data);
  },
  async addProgressStep(djId: string, data: { stepName: string; stepDate?: string }): Promise<any> {
    return apiClient.post(`/api/distribution-jobs/${djId}/progress-steps`, data);
  },
  async updateProgressStep(djId: string, stepId: string, data: any): Promise<any> {
    return apiClient.patch(`/api/distribution-jobs/${djId}/progress-steps/${stepId}`, data);
  },
  async getDocumentUploadUrl(djId: string, docType: string, contentType?: string): Promise<{ url: string; fileName: string; documentId: string }> {
    return apiClient.post(`/api/distribution-jobs/${djId}/documents/upload-url`, { docType, contentType });
  },
  async getDocumentDownloadUrl(djId: string, docType: string): Promise<{ url: string }> {
    return apiClient.get(`/api/distribution-jobs/${djId}/documents/download-url?docType=${encodeURIComponent(docType)}`);
  },
  async generatePoc(djId: string): Promise<void> {
    return downloadPdfPost(`/api/distribution-jobs/${djId}/generate-poc`, `POC-${djId}.pdf`);
  },
  async generatePod(djId: string): Promise<void> {
    return downloadPdfPost(`/api/distribution-jobs/${djId}/generate-pod`, `POD-${djId}.pdf`);
  },
};
