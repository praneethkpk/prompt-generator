import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../services/backend";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      get isAuthenticated() {
        return !!get().accessToken;
      },

      login: async (email, password) => {
        const { data } = await authApi.login({ email, password });
        const { accessToken, refreshToken, userId, name, email: userEmail } = data.data;
        set({
          user: { id: userId, name, email: userEmail },
          accessToken,
          refreshToken,
        });
        return data.data;
      },

      register: async (name, email, password) => {
        const { data } = await authApi.register({ name, email, password });
        const { accessToken, refreshToken, userId, name: userName, email: userEmail } = data.data;
        set({
          user: { id: userId, name: userName, email: userEmail },
          accessToken,
          refreshToken,
        });
        return data.data;
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore errors on logout
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.me();
          set((state) => ({ user: { ...state.user, ...data.data } }));
        } catch {
          // Token invalid
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
