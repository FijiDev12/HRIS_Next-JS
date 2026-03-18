"use client";

import { create } from "zustand";
import api from "@/app/lib/api";

/* =========================
   Types
========================= */

export interface OfficialBusinessRequest {
  id: number;
  employeeId: number;
  workDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfficialBusinessPayload {
  employeeId: number;
  workDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  createdBy: number;
}

interface ApproveRejectPayload {
  approverId: number;
  remarks: string;
}

/* =========================
   State Interface
========================= */

interface OfficialBusinessState {
  officialBusinesses: OfficialBusinessRequest[];
  officialBusiness: OfficialBusinessRequest | null;

  loading: boolean;
  error: string | null;

  fetchOfficialBusinesses: () => Promise<void>;
  fetchOfficialBusinessesByEmpId: (empId: number) => Promise<void>;
  createOfficialBusiness: (payload: CreateOfficialBusinessPayload) => Promise<void>;
  approveOfficialBusiness: (id: number, payload: ApproveRejectPayload) => Promise<void>;
  rejectOfficialBusiness: (id: number, payload: ApproveRejectPayload) => Promise<void>;

  clearError: () => void;
  clearOfficialBusiness: () => void;
}

/* =========================
   Store
========================= */

export const useOfficialBusinessStore = create<OfficialBusinessState>((set, get) => ({
  officialBusinesses: [],
  officialBusiness: null,
  loading: false,
  error: null,

  /* ===== GET ALL ===== */
  fetchOfficialBusinesses: async () => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/request/ob", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      set({ officialBusinesses: Array.isArray(res.data.data) ? res.data.data : res.data.data== null ? [] : [res.data.data], loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch official business requests",
      });
    }
  },
    /* ===== GET ALL ===== */
  fetchOfficialBusinessesByEmpId: async (empId: number) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/request/ob/${empId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      set({ officialBusinesses: Array.isArray(res.data.data) ? res.data.data : res.data.data== null ? [] : [res.data.data], loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch official business requests",
      });
    }
  },

  /* ===== CREATE ===== */
  createOfficialBusiness: async (payload) => {
    try {
      set({ loading: true, error: null });

      await api.post("/request/ob", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchOfficialBusinesses();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create official business request",
      });
    }
  },

  /* ===== APPROVE ===== */
  approveOfficialBusiness: async (id, payload) => {
    try {
      set({ loading: true, error: null });

      await api.patch(`/request/ob/approve/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchOfficialBusinesses();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to approve request",
      });
    }
  },

  /* ===== REJECT ===== */
  rejectOfficialBusiness: async (id, payload) => {
    try {
      set({ loading: true, error: null });

      await api.patch(`/request/ob/reject/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchOfficialBusinesses();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to reject request",
      });
    }
  },

  clearError: () => set({ error: null }),
  clearOfficialBusiness: () => set({ officialBusiness: null }),
}));
