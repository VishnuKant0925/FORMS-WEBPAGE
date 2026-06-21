import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import type { AuthUser } from '@/store/useAuthStore';

export const profileService = {
  getProfile: async (): Promise<AuthUser> => {
    const { data } = await api.get<{ user: AuthUser }>('/profile');
    useAuthStore.getState().setUser(data.user);
    return data.user;
  },

  updateProfile: async (payload: Partial<AuthUser>): Promise<AuthUser> => {
    const { data } = await api.patch<{ user: AuthUser }>('/profile', payload);
    useAuthStore.getState().setUser(data.user);
    return data.user;
  },
};
