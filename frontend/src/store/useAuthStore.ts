import { create } from 'zustand';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'supervisor' | 'hr' | 'admin';
  employeeCode?: string;
  department?: string;
  designation?: string;
  profilePhoto?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:        null,
  accessToken: null,
  isLoading:   true,
  setAuth:     (user, accessToken) => set({ user, accessToken }),
  setUser:     (user) => set({ user }),
  setToken:    (accessToken) => set({ accessToken }),
  clearAuth:   () => set({ user: null, accessToken: null }),
  setLoading:  (isLoading) => set({ isLoading }),
}));
