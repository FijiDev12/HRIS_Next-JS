"use client";

import { create } from "zustand";
import api from "@/app/api/withoutAuth/route";
import { toast } from "react-toastify";

/* =========================
   Types
========================= */

export interface LeaveBalance {
  id?: number;
  employeeId: number;
  leaveTypeId: number;
  totalDays: number;
  remainingDays: number;
}

interface LeaveBalanceState {
  balances: LeaveBalance[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchAllBalances: () => Promise<void>;
  fetchEmployeeBalances: (employeeId: number) => Promise<void>;
  createBalance: (payload: LeaveBalance) => Promise<void>;
  updateBalance: (id: number, payload: LeaveBalance) => Promise<void>;
  deleteBalance: (id: number) => Promise<void>;

  clearError: () => void;
}

/* =========================
   Store
========================= */

export const useLeaveBalanceStore = create<LeaveBalanceState>((set, get) => ({
  balances: [],
  loading: false,
  error: null,

  /* ===== FETCH ALL BALANCES ===== */
  fetchAllBalances: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const res = await api.get("/leave/balance/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ balances: res.data.data || [], loading: false });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to fetch leave balances";
      toast.error(errorMsg);
      set({ loading: false, error: errorMsg });
    }
  },

  /* ===== FETCH EMPLOYEE BALANCES ===== */
  fetchEmployeeBalances: async (employeeId: number) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const res = await api.get(`/leave/balance/employee/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res)

      set({ balances: Array.isArray(res.data.data) ? res.data.data : [res.data.data], loading: false });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || "Failed to fetch employee leave balances";
      toast.error(errorMsg);
      set({ loading: false, error: errorMsg });
    }
  },

  /* ===== CREATE BALANCE ===== */
  createBalance: async (payload: LeaveBalance) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const res = await api.post("/leave/balance", payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      toast.success(res.data?.message || "Leave balance created successfully");
      await get().fetchAllBalances();
      set({ loading: false });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to create leave balance";
      toast.error(errorMsg);
      set({ loading: false, error: errorMsg });
    }
  },

  /* ===== UPDATE BALANCE ===== */
  updateBalance: async (id: number, payload: LeaveBalance) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const res = await api.patch(`/leave/balance/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      toast.success(res.data?.message || "Leave balance updated successfully");
      await get().fetchAllBalances();
      set({ loading: false });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to update leave balance";
      toast.error(errorMsg);
      set({ loading: false, error: errorMsg });
    }
  },

  /* ===== DELETE BALANCE ===== */
  deleteBalance: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const res = await api.delete(`/leave/balance/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(res.data?.message || "Leave balance deleted successfully");
      await get().fetchAllBalances();
      set({ loading: false });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to delete leave balance";
      toast.error(errorMsg);
      set({ loading: false, error: errorMsg });
    }
  },

  clearError: () => set({ error: null }),
}));