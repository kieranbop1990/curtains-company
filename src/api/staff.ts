import { apiClient } from './client';
import type { StaffMember } from 'src/types/staff';

export const staffApi = {
  async getAll(activeOnly = true): Promise<StaffMember[]> {
    return apiClient.get<StaffMember[]>(`/api/staff${activeOnly ? '' : '?active=false'}`);
  },
  async create(data: { name: string; role: string; email?: string; phone?: string }): Promise<StaffMember> {
    return apiClient.post<StaffMember>('/api/staff', data);
  },
  async update(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
    return apiClient.patch<StaffMember>(`/api/staff/${id}`, data);
  },
  async deactivate(id: string): Promise<void> {
    await apiClient.del(`/api/staff/${id}`);
  },
};
