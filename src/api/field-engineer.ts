import { apiClient } from './client';
import type { DistributionJob } from 'src/types/distribution';

export const fieldEngineerApi = {
  async getMyJobs(): Promise<DistributionJob[]> {
    return apiClient.get<DistributionJob[]>('/api/field-engineer/my-jobs');
  },
  async getMyJob(djId: string): Promise<DistributionJob> {
    return apiClient.get<DistributionJob>(`/api/field-engineer/my-jobs/${djId}`);
  },
  async submitDay(djId: string, data: { dayLabel: string; customerSignature?: string; signatureDataUrl?: string; submittedAt?: string; isFinalDay?: boolean }): Promise<DistributionJob> {
    return apiClient.post<DistributionJob>(`/api/field-engineer/my-jobs/${djId}/submit-day`, data);
  },
  async getMediaUploadUrl(djId: string, fileName: string, contentType: string): Promise<{ url: string; fileName: string }> {
    return apiClient.post(`/api/field-engineer/my-jobs/${djId}/media-upload-url`, { fileName, contentType });
  },
  async getRams(djId: string): Promise<{ url: string; name: string }[]> {
    return apiClient.get(`/api/field-engineer/my-jobs/${djId}/rams`);
  },
  async reportIssue(djId: string, data: { description: string; severity: string; hasPhoto: boolean }): Promise<void> {
    return apiClient.post(`/api/field-engineer/my-jobs/${djId}/issues`, data);
  },
};

// Photo queue using localStorage for offline persistence
const PHOTO_QUEUE_KEY = 'fc_photo_queue';

interface QueuedPhoto {
  id: string;
  djId: string;
  uploadUrl: string;
  dataUrl: string;
  contentType: string;
  mediaType: string;
  status: 'queued' | 'uploading' | 'done' | 'failed';
  queuedAt: string;
}

export const photoQueue = {
  get(): QueuedPhoto[] {
    try {
      return JSON.parse(localStorage.getItem(PHOTO_QUEUE_KEY) ?? '[]');
    } catch {
      return [];
    }
  },
  add(photo: QueuedPhoto) {
    const queue = this.get();
    queue.push(photo);
    localStorage.setItem(PHOTO_QUEUE_KEY, JSON.stringify(queue));
  },
  update(id: string, update: Partial<QueuedPhoto>) {
    const queue = this.get().map(p => p.id === id ? { ...p, ...update } : p);
    localStorage.setItem(PHOTO_QUEUE_KEY, JSON.stringify(queue));
  },
  remove(id: string) {
    const queue = this.get().filter(p => p.id !== id);
    localStorage.setItem(PHOTO_QUEUE_KEY, JSON.stringify(queue));
  },
  async processQueue() {
    const queue = this.get().filter(p => p.status === 'queued' || p.status === 'failed');
    for (const photo of queue) {
      this.update(photo.id, { status: 'uploading' });
      try {
        const blob = await fetch(photo.dataUrl).then(r => r.blob());
        await fetch(photo.uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': photo.contentType } });
        this.remove(photo.id);
      } catch {
        this.update(photo.id, { status: 'failed' });
      }
    }
  },
};
