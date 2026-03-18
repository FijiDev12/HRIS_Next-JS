"use client";

import { create } from "zustand";
import api from "@/app/lib/api";

/* =========================
   Types
========================= */

export interface Site {
  id: number;
  siteName: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  latitude?: number;
  longitude?: number;
  radius?: number;
  data?: {
    id: number;
    departmentId: number;
    positionName: string;
    createdBy?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

interface CreateSitePayload {
  siteName: string;
  createdBy: number;
}

interface UpdateSitePayload {
  siteName: string;
  createdBy: number;
}

/* =========================
   State Interface
========================= */

interface SiteState {
  sites: Site[];
  site: Site | null;
  loading: boolean;
  error: string | null;

  fetchSites: () => Promise<void>;
  fetchSiteById: (id: number) => Promise<void>;
  createSite: (payload: CreateSitePayload) => Promise<void>;
  updateSite: (id: number, payload: UpdateSitePayload) => Promise<void>;
  deleteSite: (id: number) => Promise<void>;

  clearError: () => void;
  clearSite: () => void;
}

/* =========================
   Store
========================= */

export const useSiteStore = create<SiteState>((set, get) => ({
  sites: [],
  site: null,
  loading: false,
  error: null,

  /* ===== GET ALL SITES ===== */
  fetchSites: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");

      const res = await api.get("/site", {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ sites: res.data.data || [], loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch sites",
      });
    }
  },

  /* ===== GET SITE BY ID ===== */
fetchSiteById: async (id) => {
  try {
    set({ loading: true, error: null });
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No access token found");

    const res = await api.get(`/site/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    set({ site: res.data?.data || res.data || null, loading: false });
  } catch (err: any) {
    console.error("fetchSiteById error:", err);
    set({
      loading: false,
      error: err?.response?.data?.message || err?.message || "Failed to fetch site",
    });
  }
},

  /* ===== CREATE SITE ===== */
  createSite: async (payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");

      const res = await api.post("/site", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // ✅ Add new site to local state
      set({ sites: [...get().sites, res.data.data], loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create site",
      });
    }
  },

  /* ===== UPDATE SITE ===== */
  updateSite: async (id, payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");

      const res = await api.patch(`/site/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // ✅ Update site in local array
      set({
        sites: get().sites.map((s) => (s.id === id ? res.data.data : s)),
        // ✅ Update selected site if it's the same
        site: get().site?.id === id ? res.data.data : get().site,
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to update site",
      });
    }
  },

  /* ===== DELETE SITE ===== */
  deleteSite: async (id) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");

      await api.delete(`/site/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // ✅ Remove deleted site from local array
      set({
        sites: get().sites.filter((s) => s.id !== id),
        site: get().site?.id === id ? null : get().site,
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to delete site",
      });
    }
  },

  clearError: () => set({ error: null }),
  clearSite: () => set({ site: null }),
}));