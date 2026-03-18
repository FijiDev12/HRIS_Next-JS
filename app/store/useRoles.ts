"use client";

import { create } from "zustand";
import api from "@/app/lib/api";

/* =========================
   Types
========================= */

export interface Role {
  id: number;
  roleName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRolePayload {
  roleName: string;
}

export interface UpdateRolePayload {
  roleName: string;
}

/* =========================
   State Interface
========================= */

interface RoleState {
  roles: Role[];
  role: Role | null;

  loading: boolean;
  error: string | null;

  fetchRoles: () => Promise<void>;
  fetchRoleById: (id: number) => Promise<void>;
  createRole: (payload: CreateRolePayload) => Promise<void>;
  updateRole: (id: number, payload: UpdateRolePayload) => Promise<void>;
  deleteRole: (id: number) => Promise<void>;

  clearError: () => void;
  clearRole: () => void;
}

/* =========================
   Store
========================= */

export const useRoleStore = create<RoleState>((set, get) => ({
  roles: [],
  role: null,
  loading: false,
  error: null,

  /* ===== GET ALL ===== */
  fetchRoles: async () => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/role", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      set({ roles: res.data.data, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch roles",
      });
    }
  },

  /* ===== GET BY ID ===== */
  fetchRoleById: async (id) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/role/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      set({ role: res.data.data, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch role",
      });
    }
  },

  /* ===== CREATE ===== */
  createRole: async (payload) => {
    try {
      set({ loading: true, error: null });

      await api.post("/role", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchRoles();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create role",
      });
    }
  },

  /* ===== UPDATE ===== */
  updateRole: async (id, payload) => {
    try {
      set({ loading: true, error: null });

      await api.patch(`/role/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchRoles();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to update role",
      });
    }
  },

  /* ===== DELETE ===== */
  deleteRole: async (id) => {
    try {
      set({ loading: true, error: null });

      await api.delete(`/role/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      await get().fetchRoles();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to delete role",
      });
    }
  },

  clearError: () => set({ error: null }),
  clearRole: () => set({ role: null }),
}));
