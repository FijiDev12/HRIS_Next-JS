"use client";

import { create } from "zustand";
import api from "@/app/lib/api";

/* ===============================
   HOLIDAY TYPES
=============================== */
export interface Holiday {
  id: number;
  holidayName: string;
  holidayDate: string;
  siteId: number;
  createdBy: number;
  type: "REGULAR" | "SPECIAL";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHolidayPayload {
  holidayName: string;
  holidayDate: string;
  siteId: number;
  createdBy: number;
  type: "REGULAR" | "SPECIAL";
}

export interface UpdateHolidayPayload extends CreateHolidayPayload {
  id: number;
}

interface HolidayState {
  holidays: Holiday[];
  holiday: Holiday | null;
  loading: boolean;
  error: string | null;

  fetchHolidays: () => Promise<void>;
  fetchHolidayById: (id: number) => Promise<void>;
  createHoliday: (payload: CreateHolidayPayload) => Promise<void>;
  updateHoliday: (payload: UpdateHolidayPayload) => Promise<void>;
  deleteHoliday: (id: number) => Promise<void>;
}

/* ===============================
   HOLIDAY STORE
=============================== */
export const useHolidayStore = create<HolidayState>((set, get) => ({
  holidays: [],
  holiday: null,
  loading: false,
  error: null,

  /* ===============================
     FETCH ALL HOLIDAYS
  =============================== */
  fetchHolidays: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      const res = await api.get("/holiday", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ holidays: res.data.data || [], loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch holidays",
      });
    }
  },

  /* ===============================
     FETCH HOLIDAY BY ID
  =============================== */
  fetchHolidayById: async (id) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      const res = await api.get(`/holiday/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ holiday: res.data.data || null, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch holiday",
      });
    }
  },

  /* ===============================
     CREATE HOLIDAY
  =============================== */
  createHoliday: async (payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      await api.post("/holiday", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await get().fetchHolidays();
      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create holiday",
      });
    }
  },

  /* ===============================
     UPDATE HOLIDAY
  =============================== */
  updateHoliday: async (payload) => {
    console.log(payload)
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      await api.patch(`/holiday/${payload.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await get().fetchHolidays();
      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to update holiday",
      });
    }
  },

  /* ===============================
     DELETE HOLIDAY
  =============================== */
  deleteHoliday: async (id) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      await api.delete(`/holiday/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await get().fetchHolidays();
      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to delete holiday",
      });
    }
  },
}));