"use client";

import { create } from "zustand";
import api from "@/app/lib/api";

/* =========================
   Types
========================= */
export interface Position {
  id: number;
  departmentId: number;
  positionName: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  data?: {
    id: number;
    departmentId: number;
    positionName: string;
    createdBy?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface CreatePositionPayload {
  departmentId: number;
  positionName: string;
  createdBy: number;
}

export interface UpdatePositionPayload {
  departmentId?: number;
  positionName?: string;
  createdBy?: number;
}

/* =========================
   State Interface
========================= */

interface PositionState {
  positions: Position[];
  position: Position | null;

  loading: boolean;
  error: string | null;

  fetchPositions: () => Promise<void>;
  fetchPositionById: (id: number) => Promise<void>;
  createPosition: (payload: CreatePositionPayload) => Promise<void>;
  updatePosition: (id: number, payload: UpdatePositionPayload) => Promise<void>;
  deletePosition: (id: number) => Promise<void>;

  clearError: () => void;
  clearPosition: () => void;
}

/* =========================
   Store
========================= */

export const usePositionStore = create<PositionState>((set, get) => ({
  positions: [],
  position: null,
  loading: false,
  error: null,

  /* ===== GET ALL ===== */
  fetchPositions: async () => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/position", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      set({ positions: res.data.data, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch positions",
      });
    }
  },

  /* ===== GET BY ID ===== */
  fetchPositionById: async (id) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/position/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      set({ position: res.data.data, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch position",
      });
    }
  },

  /* ===== CREATE ===== */
  createPosition: async (payload) => {
    try {
      set({ loading: true, error: null });

      await api.post("/position", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchPositions();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create position",
      });
    }
  },

  /* ===== UPDATE ===== */
  updatePosition: async (id, payload) => {
    try {
      set({ loading: true, error: null });

      await api.patch(`/position/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchPositions();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to update position",
      });
    }
  },

  /* ===== DELETE ===== */
  deletePosition: async (id) => {
    try {
      set({ loading: true, error: null });

      await api.delete(`/position/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      await get().fetchPositions();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to delete position",
      });
    }
  },

  clearError: () => set({ error: null }),
  clearPosition: () => set({ position: null }),
}));
