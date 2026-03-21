"use client";

import { create } from "zustand";
import api from "@/app/lib/api";

/* ===============================
   BREAKTIME TYPES
=============================== */
export interface Breaktime {
  id: number;
  shiftId: number;
  startTime: string;
  endTime: string;
  isFlexible: boolean;
  isPaid: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBreaktimePayload {
  shiftId: number;
  startTime: string;
  endTime: string;
  isFlexible: boolean;
  isPaid: boolean;
}

export interface UpdateBreaktimePayload extends CreateBreaktimePayload {
  id: number;
}

interface BreaktimeState {
  breaktimes: Breaktime[];
  breaktime: Breaktime | null;
  loading: boolean;
  error: string | null;

  fetchBreaktimes: () => Promise<void>;
  fetchBreaktimeById: (id: number) => Promise<void>;
  createBreaktime: (payload: CreateBreaktimePayload) => Promise<void>;
  updateBreaktime: (payload: UpdateBreaktimePayload) => Promise<void>;
  deleteBreaktime: (id: number) => Promise<void>;
}

/* ===============================
   BREAKTIME STORE
=============================== */
export const useBreaktimeStore = create<BreaktimeState>((set, get) => ({
  breaktimes: [],
  breaktime: null,
  loading: false,
  error: null,

  /* ===============================
     FETCH ALL BREAKTIMES
  =============================== */
  fetchBreaktimes: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const res = await api.get("/breaktime", {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ breaktimes: res.data.data || [], loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch breaktimes",
      });
    }
  },

  /* ===============================
     FETCH BREAKTIME BY ID
  =============================== */
  fetchBreaktimeById: async (id) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const res = await api.get(`/breaktime/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ breaktime: res.data.data || null, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch breaktime",
      });
    }
  },

  /* ===============================
     CREATE BREAKTIME
  =============================== */
  createBreaktime: async (payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      await api.post("/breaktime", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchBreaktimes();
      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create breaktime",
      });
    }
  },

  /* ===============================
     UPDATE BREAKTIME
  =============================== */
  updateBreaktime: async (payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      await api.patch(`/breaktime/${payload.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchBreaktimes();
      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to update breaktime",
      });
    }
  },

  /* ===============================
     DELETE BREAKTIME
  =============================== */
  deleteBreaktime: async (id) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      await api.delete(`/breaktime/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await get().fetchBreaktimes();
      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to delete breaktime",
      });
    }
  },
}));