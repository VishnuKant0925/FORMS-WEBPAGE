import api from '@/lib/axios';
import type { Submission, PaginatedResponse } from '@/types';
import type { AuthUser } from '@/store/useAuthStore';

export const adminService = {
  getAllSubmissions: async (params?: {
    page?: number; limit?: number; formType?: string;
    status?: string; search?: string;
  }) => {
    const { data } = await api.get<PaginatedResponse<Submission>>('/admin/submissions', { params });
    return data;
  },

  approveSubmission: async (id: string, comment?: string) => {
    const { data } = await api.patch<{ submission: Submission }>(`/admin/submissions/${id}/approve`, { comment });
    return data.submission;
  },

  rejectSubmission: async (id: string, comment: string) => {
    const { data } = await api.patch<{ submission: Submission }>(`/admin/submissions/${id}/reject`, { comment });
    return data.submission;
  },

  returnSubmission: async (id: string, comment: string) => {
    const { data } = await api.patch<{ submission: Submission }>(`/admin/submissions/${id}/return`, { comment });
    return data.submission;
  },

  getAnalytics: async () => {
    const { data } = await api.get('/admin/analytics');
    return data;
  },

  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get<PaginatedResponse<AuthUser>>('/admin/users', { params });
    return data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const { data } = await api.patch<{ user: AuthUser }>(`/admin/users/${userId}/role`, { role });
    return data.user;
  },
};
