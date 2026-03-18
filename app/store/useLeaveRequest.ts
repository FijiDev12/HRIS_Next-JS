"use client";

import { create } from "zustand";
import api from "@/app/lib/api";

/* =========================
   Types
========================= */

export interface LeaveRequest {
  updatedBy: {};
  type: unknown;
  end: unknown;
  start: unknown;
  id: number;
  employeeId: number;
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestPayload {
  employeeId: number;
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  createdBy: number;
}

interface ApproveRejectPayload {
  approverId: number;
  remarks: string;
}

/* =========================
   State Interface
========================= */

interface LeaveRequestState {
  leaveRequests: LeaveRequest[];
  leaveRequest: LeaveRequest | null;

  loading: boolean;
  error: string | null;

  // APIs
  fetchLeaveRequests: () => Promise<void>;
  fetchLeaveRequestsByEmployee: (employeeId?: number) => Promise<void>;
  createLeaveRequest: (payload: CreateLeaveRequestPayload) => Promise<void>;
  approveLeaveRequest: (id: number, payload: ApproveRejectPayload) => Promise<void>;
  rejectLeaveRequest: (id: number, payload: ApproveRejectPayload) => Promise<void>;

  // Utils
  clearError: () => void;
  clearLeaveRequest: () => void;
}

/* =========================
   Store
========================= */

export const useLeaveRequestStore = create<LeaveRequestState>((set, get) => ({
  leaveRequests: [],
  leaveRequest: null,

  loading: false,
  error: null,

  /* ===== GET ALL LEAVE REQUESTS ===== */
  fetchLeaveRequests: async () => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/leave/request/employee", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      set({ leaveRequests:Array.isArray(res.data.data) ? res.data.data : res.data.data== null ? [] : [res.data.data], loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch leave requests",
      });
    }
  },

  /* ===== GET LEAVE REQUESTS BY EMPLOYEE ID ===== */
  fetchLeaveRequestsByEmployee: async (employeeId) => {
    try {
      set({ loading: true, error: null });

      const endpoint = employeeId ? `/leave/request/employee/${employeeId}` : "/leave/request/employee";
      const res = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      set({ leaveRequests:Array.isArray(res.data.data) ? res.data.data : res.data.data== null ? [] : [res.data.data], loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch leave requests",
      });
    }
  },

  /* ===== CREATE LEAVE REQUEST ===== */
  createLeaveRequest: async (payload) => {
    try {
      set({ loading: true, error: null });

      await api.post("/leave/request", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchLeaveRequests();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create leave request",
      });
    }
  },

  /* ===== APPROVE LEAVE REQUEST ===== */
  approveLeaveRequest: async (id, payload) => {
    try {
      set({ loading: true, error: null });

      await api.patch(`/leave/approve/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchLeaveRequests();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to approve leave request",
      });
    }
  },

  /* ===== REJECT LEAVE REQUEST ===== */
  rejectLeaveRequest: async (id, payload) => {
    try {
      set({ loading: true, error: null });

      await api.patch(`/leave/reject/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchLeaveRequests();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to reject leave request",
      });
    }
  },

  clearError: () => set({ error: null }),
  clearLeaveRequest: () => set({ leaveRequest: null }),
}));
