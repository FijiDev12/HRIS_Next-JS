"use client";
import { create } from "zustand";
import api from "@/app/api/withoutAuth/route";

export interface Schedule {
  id: number;
  shiftName: string;
}

interface ScheduleState {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;

  fetchSchedules: () => Promise<void>;
  createSchedule: (payload: { shiftName: string }) => Promise<void>;
  updateSchedule: (id: number, payload: { shiftName: string }) => Promise<void>;
  deleteSchedule: (id: number) => Promise<void>;

  clearError: () => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  loading: false,
  error: null,

  /* ===== FETCH ALL SCHEDULES ===== */
  fetchSchedules: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const res = await api.get("/schedule", {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ schedules: res.data.data, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch schedules",
      });
    }
  },

  /* ===== CREATE SCHEDULE ===== */
  createSchedule: async (payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      await api.post("/schedule", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchSchedules();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create schedule",
      });
    }
  },

  /* ===== UPDATE SCHEDULE ===== */
  updateSchedule: async (id, payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      await api.patch(`/schedule/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchSchedules();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to update schedule",
      });
    }
  },

  /* ===== DELETE SCHEDULE ===== */
  deleteSchedule: async (id) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      await api.delete(`/schedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await get().fetchSchedules();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to delete schedule",
      });
    }
  },

  clearError: () => set({ error: null }),
}));