"use client";

import { create } from "zustand";
import api from "@/app/lib/api";

/* =========================
   Types
========================= */

export interface OTRequest {
  id: number;
  employeeId: number;
  workDate: string;
  startTime: string;
  endTime: string;
  totalMinutes: number;
  reason: string;
  status: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOTPayload {
  employeeId: number;
  workDate: string;
  startTime: string;
  endTime: string;
  totalMinutes: number;
  reason: string;
  createdBy: number;
}

/* ✅ ONLY CHANGE IS HERE */
interface ApproveRejectPayload {
  approverId: number;
  remarks: string;
  workDate: string;      // added (typed properly)
  employeeId: number;    // added (typed properly)
}

/* =========================
   State Interface
========================= */

interface OTRequestState {
  otRequests: OTRequest[];
  otRequest: OTRequest | null;

  loading: boolean;
  error: string | null;

  // APIs
  fetchOTRequests: () => Promise<void>;
  fetchOTRequestByEmpId: (id: number) => Promise<void>;
  createOTRequest: (payload: CreateOTPayload) => Promise<void>;
  approveOTRequest: (id: number, payload: ApproveRejectPayload) => Promise<void>;
  rejectOTRequest: (id: number, payload: ApproveRejectPayload) => Promise<void>;

  // Utils
  clearError: () => void;
  clearOTRequest: () => void;
}

/* =========================
   Store
========================= */

export const useOTRequestStore = create<OTRequestState>((set, get) => ({
  otRequests: [],
  otRequest: null,
  loading: false,
  error: null,

  /* ===== GET ALL OT REQUESTS ===== */
  fetchOTRequests: async () => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/request/ot", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      set({
        otRequests: Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data == null
          ? []
          : [res.data.data],
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch OT requests",
      });
    }
  },

  /* ===== GET OT REQUEST BY ID ===== */
  fetchOTRequestByEmpId: async (id) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/request/ot/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      set({
        otRequests: Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data == null
          ? []
          : [res.data.data],
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch OT request",
      });
    }
  },

  /* ===== CREATE OT REQUEST ===== */
  createOTRequest: async (payload) => {
    try {
      set({ loading: true, error: null });

      await api.post("/request/ot", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchOTRequests();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create OT request",
      });
    }
  },

  /* ===== APPROVE OT REQUEST ===== */
  approveOTRequest: async (id, payload) => {
    try {
      set({ loading: true, error: null });

      await api.patch(`/request/ot/approve/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchOTRequests();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to approve OT request",
      });
    }
  },

  /* ===== REJECT OT REQUEST ===== */
  rejectOTRequest: async (id, payload) => {
    try {
      set({ loading: true, error: null });

      await api.patch(`/request/ot/reject/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchOTRequests();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to reject OT request",
      });
    }
  },

  clearError: () => set({ error: null }),
  clearOTRequest: () => set({ otRequest: null }),
}));