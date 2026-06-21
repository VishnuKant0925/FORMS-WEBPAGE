import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import type { LoginPayload, RegisterPayload, AuthResponse } from '@/types';

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    useAuthStore.getState().setAuth(data.user, data.accessToken);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    useAuthStore.getState().setAuth(data.user, data.accessToken);
    return data;
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/google', { credential });
    useAuthStore.getState().setAuth(data.user, data.accessToken);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    useAuthStore.getState().clearAuth();
  },

  refreshToken: async (): Promise<string | null> => {
    try {
      const { data } = await api.post<{ accessToken: string; user: any }>('/auth/refresh');
      useAuthStore.getState().setAuth(data.user, data.accessToken);
      return data.accessToken;
    } catch {
      useAuthStore.getState().clearAuth();
      return null;
    }
  },
};
