import api from '@/lib/axios';
import type { FormType, Submission, PaginatedResponse } from '@/types';

export const formService = {
  saveDraft: async (formType: FormType, language: string, formData: Record<string, unknown>) => {
    const { data } = await api.post<{ submission: Submission }>('/forms/draft', { formType, language, formData });
    return data.submission;
  },

  submit: async (formType: FormType, language: string, formData: Record<string, unknown>) => {
    const { data } = await api.post<{ submission: Submission }>('/forms/submit', { formType, language, formData });
    return data.submission;
  },

  getHistory: async (params?: { page?: number; limit?: number; formType?: string; status?: string }) => {
    const { data } = await api.get<PaginatedResponse<Submission>>('/forms/history', { params });
    return data;
  },

  getSubmission: async (id: string) => {
    const { data } = await api.get<{ submission: Submission }>(`/forms/${id}`);
    return data.submission;
  },

  updateDraft: async (id: string, formData: Record<string, unknown>, language?: string) => {
    const { data } = await api.put<{ submission: Submission }>(`/forms/${id}`, { formData, language });
    return data.submission;
  },

  deleteDraft: async (id: string) => {
    await api.delete(`/forms/${id}`);
  },

  downloadPdf: async (submissionId: string, filename: string) => {
    const response = await api.get(`/pdf/${submissionId}`, { responseType: 'blob' });
    const url  = URL.createObjectURL(new Blob([response.data as BlobPart], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href     = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  getStats: async () => {
    const { data } = await api.get<{ stats: { total: number; approved: number; pending: number; rejected: number; drafts: number } }>('/forms/stats');
    return data.stats;
  },
};
