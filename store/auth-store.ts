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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      updateUser: (user) => set({ user }),
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
