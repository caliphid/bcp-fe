import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  fetchMe: () => Promise<void>;
  activePortal: 'FINANCE' | 'OMS' | null;
  setActivePortal: (portal: 'FINANCE' | 'OMS' | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user, activePortal: null }),
      logout: () => set({ token: null, user: null, activePortal: null }),
      updateUser: (user) => set({ user }),
      activePortal: null,
      setActivePortal: (portal) => set({ activePortal: portal }),
      fetchMe: async () => {
        try {
          const { authApi } = await import("../features/auth/api");
          const res = await authApi.getMe();
          set({ user: res.data });
        } catch (err) {
          // If fetch fails, we might just leave the current user or logout
          console.error("Failed to fetch me", err);
        }
      },
    }),
    {
      name: 'bcp-auth-storage',
    }
  )
);
