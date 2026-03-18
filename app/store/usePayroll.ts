"use client";

import { create } from "zustand";
import api from "@/app/lib/api";
import { toast } from "react-toastify";

/* =========================
   Types
========================= */

export interface Payroll {
  id?: number;
  employeeId: number;
  payrollPeriodId: number;
  // add more payroll fields if needed
}

export interface PayrollPeriod {
  id?: number;
  startDate: string;
  endDate: string;
  siteId: number;
  name?: string; // optional, for displaying in UI
}

interface PayrollState {
  payrolls: Payroll[];
  periods: PayrollPeriod[];
  loading: boolean;
  error: string | null;

  generatePayroll: (payload: { employeeId: number; payrollPeriodId: number }) => Promise<void>;
  getPayrollByPeriod: (periodId: number) => Promise<void>;
  approvePayroll: (periodId: number, performedBy: number) => Promise<void>;
  unlockPayroll: (periodId: number, performedBy: number) => Promise<void>;
  deletePayrollByPeriod: (periodId: number) => Promise<void>;
  reversePayroll: (payrollId: number, performedBy: number) => Promise<void>;

  createPayrollPeriod: (payload: PayrollPeriod) => Promise<void>;
  postPayrollPeriod: (periodId: number) => Promise<void>;
  deletePayrollPeriod: (periodId: number) => Promise<void>;
  fetchPeriods: () => Promise<void>; // NEW METHOD

  clearError: () => void;
}

/* =========================
   Store
========================= */

export const usePayrollStore = create<PayrollState>((set, get) => ({
  payrolls: [],
  periods: [],
  loading: false,
  error: null,

  /* ===== GENERATE PAYROLL ===== */
  generatePayroll: async (payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      const res = await api.post("/payroll/generate", payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      toast.success(res.data?.message || "Payroll generated successfully");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to generate payroll";
    //   toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== GET PAYROLL BY PERIOD ===== */
  getPayrollByPeriod: async (periodId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      const res = await api.get(`/payroll/period/${periodId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ payrolls: res.data?.data || [] });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to fetch payroll";
    //   toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== APPROVE PAYROLL ===== */
  approvePayroll: async (periodId, performedBy) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      const res = await api.patch(`/payroll/period/approve/${periodId}`, { performedBy }, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      toast.success(res.data?.message || "Payroll approved successfully");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to approve payroll";
    //   toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== UNLOCK PAYROLL ===== */
  unlockPayroll: async (periodId, performedBy) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      const res = await api.patch(`/payroll/period/approve/${periodId}`, { performedBy }, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      toast.success(res.data?.message || "Payroll unlocked successfully");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to unlock payroll";
    //   toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== DELETE PAYROLL BY PERIOD ===== */
  deletePayrollByPeriod: async (periodId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      await api.delete(`/payroll/period/${periodId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Payroll deleted successfully");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to delete payroll";
    //   toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== REVERSE PAYROLL ===== */
  reversePayroll: async (payrollId, performedBy) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      await api.patch(`/payroll/reverse/${payrollId}`, { performedBy }, {
         headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Payroll reversed successfully");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to reverse payroll";
    //   toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== CREATE PAYROLL PERIOD ===== */
  createPayrollPeriod: async (payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      const res = await api.post("/payroll/period", payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      toast.success(res.data?.message || "Payroll period created successfully");
      get().fetchPeriods();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to create payroll period";
    //   toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== POST (LOCK) PAYROLL PERIOD ===== */
  postPayrollPeriod: async (periodId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      const res = await api.patch(`/payroll/period/post/${periodId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data?.message || "Payroll period posted successfully");
      get().fetchPeriods();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to post payroll period";
    //   toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== DELETE PAYROLL PERIOD ===== */
  deletePayrollPeriod: async (periodId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      const res = await api.patch(`/payroll/period/post/${periodId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      get().fetchPeriods();
      toast.success(res.data?.message || "Payroll period deleted successfully");
      
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to delete payroll period";
    //   toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /* ===== FETCH ALL PAYROLL PERIODS (NEW) ===== */
  fetchPeriods: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      const res = await api.get("/payroll/period", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ periods: res.data?.data || [] });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to fetch payroll periods";
    //   toast.error(errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));