"use client";

import { create } from "zustand";
import api from "@/app/lib/api";

/* =========================
   Types
========================= */

export interface GovContribution {
  id: number;
  type: string; // SSS, PhilHealth, Pagibig, etc.
  minSalary: number;
  maxSalary: number;
  employeeShare: number;
  employerShare: number;
}

interface GovContributionStore {
  contributions: GovContribution[];
  selectedContribution: GovContribution | null;
  loading: boolean;
  error: string | null;

  getContributions: () => Promise<void>;
  getContributionById: (id: number) => Promise<void>;
  createContribution: (data: Omit<GovContribution, "id">) => Promise<void>;
  updateContribution: (id: number, data: Omit<GovContribution, "id">) => Promise<void>;
  deleteContribution: (id: number) => Promise<void>;
}

/* =========================
   Store
========================= */

export const useGovContributionStore = create<GovContributionStore>((set) => ({
  contributions: [],
  selectedContribution: null,
  loading: false,
  error: null,

  /* =========================
     GET ALL
  ========================= */
  getContributions: async () => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem("accessToken");

      const res = await api.get("/gov/contribution", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ contributions: Array.isArray(res.data.data) ? res.data.data : [res.data.data], loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to fetch contributions",
        loading: false,
      });
    }
  },

  /* =========================
     GET BY ID
  ========================= */
  getContributionById: async (id: number) => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem("accessToken");

      const res = await api.get(`/gov/contribution/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ selectedContribution: res.data, loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to fetch contribution",
        loading: false,
      });
    }
  },

  /* =========================
     CREATE
  ========================= */
  createContribution: async (data) => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem("accessToken");

      await api.post("/gov/contribution", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await useGovContributionStore.getState().getContributions();

      set({ loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to create contribution",
        loading: false,
      });
    }
  },

  /* =========================
     UPDATE
  ========================= */
  updateContribution: async (id, data) => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem("accessToken");
      await api.patch(`/gov/contribution/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await useGovContributionStore.getState().getContributions();

      set({ loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to update contribution",
        loading: false,
      });
    }
  },

  /* =========================
     DELETE
  ========================= */
  deleteContribution: async (id: number) => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem("accessToken");

      await api.delete(`/gov/contribution/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await useGovContributionStore.getState().getContributions();

      set({ loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to delete contribution",
        loading: false,
      });
    }
  },
}));