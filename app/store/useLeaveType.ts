"use client";

import { create } from "zustand";
import api from "@/app/api/withoutAuth/route";
import { toast } from "react-toastify";

/* =========================
   Types
========================= */

export interface Leave {
  id?: number;
  leaveName: string;
  createdBy: number;
  createdAt?: string;
  updatedAt?: string;
}

interface LeaveState {
  leaves: Leave[];
  loading: boolean;
  error: string | null;

  getLeaves: () => Promise<void>;
  getLeaveById: (id: number) => Promise<Leave | null>;
  createLeave: (payload: Leave) => Promise<void>;
  updateLeave: (id: number, payload: Leave) => Promise<void>;
  deleteLeave: (id: number) => Promise<void>;

  clearError: () => void;
  clearLeaves: () => void;
}

/* =========================
   Store
========================= */

export const useLeaveStore = create<LeaveState>((set, get) => ({
  leaves: [],
  loading: false,
  error: null,

  /* ===== GET ALL LEAVES ===== */
  getLeaves: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");
      const res = await api.get("/leave", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ leaves: Array.isArray(res.data.data) ? res.data.data : [res.data.data] });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch leaves";
      toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== GET LEAVE BY ID ===== */
  getLeaveById: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");
      const res = await api.get(`/leave/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data || null;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch leave";
      toast.error(errorMsg);
      set({ error: errorMsg });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  /* ===== CREATE LEAVE ===== */
  createLeave: async (payload: Leave) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");
      const res = await api.post("/leave", payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      toast.success(res.data?.message || "Leave created successfully");

      // Refresh leaves list
      await get().getLeaves();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to create leave";
      toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== UPDATE LEAVE ===== */
  updateLeave: async (id: number, payload: Leave) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");
      const res = await api.patch(`/leave/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      toast.success(res.data?.message || "Leave updated successfully");

      // Refresh leaves list
      await get().getLeaves();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to update leave";
      toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== DELETE LEAVE ===== */
  deleteLeave: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");
      await api.delete(`/leave/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Leave deleted successfully");

      // Refresh leaves list
      await get().getLeaves();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to delete leave";
      toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
  clearLeaves: () => set({ leaves: [] }),
}));