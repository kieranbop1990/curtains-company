import { apiClient } from './client';
import type { Part } from 'src/types/parts';

export const partsApi = {
  async getAll(activeOnly = true, category?: string): Promise<Part[]> {
    const params = new URLSearchParams();
    if (!activeOnly) params.set('active', 'false');
    if (category) params.set('category', category);
    const qs = params.toString();
    return apiClient.get<Part[]>(`/api/parts${qs ? `?${qs}` : ''}`);
  },
  async create(data: Omit<Part, 'id' | 'partRef' | 'createdAt' | 'updatedAt'>): Promise<Part> {
    return apiClient.post<Part>('/api/parts', data);
  },
  async update(id: string, data: Partial<Part>): Promise<Part> {
    return apiClient.patch<Part>(`/api/parts/${id}`, data);
  },
  async deactivate(id: string): Promise<void> {
    await apiClient.del(`/api/parts/${id}`);
  },
};
