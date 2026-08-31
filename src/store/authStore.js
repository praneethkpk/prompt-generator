import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  refreshToken: null,

  get isAuthenticated() {
    return !!this.token;
  },

  login: (user, token, refreshToken) => {
    set({ user, token, refreshToken });
  },

  register: (user, token, refreshToken) => {
    set({ user, token, refreshToken });
  },

  logout: () => {
    set({ user: null, token: null, refreshToken: null });
  },

  updateUser: (userData) => {
    set((state) => ({ user: { ...state.user, ...userData } }));
  },
}));
