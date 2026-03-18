"use client";

import { create } from "zustand";
import api from "@/app/lib/api";

interface Role {
  id: number;
  roleName: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  token: string;
  role: Role | null;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ user: User; accessToken: string } | null>;
  logout: () => void;
  clearError: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = res.data.data;

      // Save in state
      set({
        user,
        accessToken,
        refreshToken,
        loading: false,
      });

      // Save in localStorage
      localStorage.setItem("accessToken", accessToken || "");
      localStorage.setItem("refreshToken", refreshToken || "");
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("id", user?.id || "");

      // Return data to the page for navigation
      return { user, accessToken };
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Login failed",
      });
      return null;
    }
  },

  logout: () => {
    set({ user: null, accessToken: null, refreshToken: null });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("id");
  },

  clearError: () => set({ error: null }),

  loadFromStorage: () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const user = localStorage.getItem("user");

    if (accessToken && refreshToken && user) {
      set({
        accessToken,
        refreshToken,
        user: JSON.parse(user),
      });
    }
  },
}));
