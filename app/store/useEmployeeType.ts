"use client";

import { create } from "zustand";
import api from "@/app/api/withoutAuth/route"; // your axios/fetch wrapper

export interface EmploymentStatus {
  id?: number;
  employmentType: string;
  createdBy: number;
}

interface EmploymentStatusStore {
  employmentStatuses: EmploymentStatus[];
  fetchEmploymentStatuses: () => Promise<void>;
  getEmploymentStatus: (id: number) => Promise<EmploymentStatus | null>;
  createEmploymentStatus: (data: EmploymentStatus) => Promise<void>;
  updateEmploymentStatus: (id: number, data: Partial<EmploymentStatus>) => Promise<void>;
  deleteEmploymentStatus: (id: number) => Promise<void>;
}

export const useEmploymentStatusStore = create<EmploymentStatusStore>((set, get) => ({
  employmentStatuses: [],
    
  fetchEmploymentStatuses: async () => {
    try {
        const token = localStorage.getItem("accessToken");
      const res = await api.get("/employee/employment/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
      set({ employmentStatuses: Array.isArray(res.data.data) ? res.data.data : [res.data.data], });
    } catch (err) {
      console.error("Error fetching employment statuses:", err);
    }
  },

  getEmploymentStatus: async (id: number) => {
    try {
        const token = localStorage.getItem("accessToken");
      const res = await api.get(`/employee/employment/status/${id}`,{
          headers: { Authorization: `Bearer ${token}` },
        });
      return res.data;
    } catch (err) {
      console.error(`Error fetching employment status id=${id}:`, err);
      return null;
    }
  },

  createEmploymentStatus: async (data: EmploymentStatus) => {
    try {
        const token = localStorage.getItem("accessToken");
      await api.post("/employee/employment/status", data,{
          headers: { Authorization: `Bearer ${token}` },
        });
      await get().fetchEmploymentStatuses(); // refresh list
    } catch (err) {
      console.error("Error creating employment status:", err);
    }
  },

  updateEmploymentStatus: async (id: number, data: Partial<EmploymentStatus>) => {
    try {
        const token = localStorage.getItem("accessToken");
      await api.patch(`/employee/employment/status/${id}`, data,{
          headers: { Authorization: `Bearer ${token}` },
        });
      await get().fetchEmploymentStatuses();
    } catch (err) {
      console.error(`Error updating employment status id=${id}:`, err);
    }
  },

  deleteEmploymentStatus: async (id: number) => {
    try {
        const token = localStorage.getItem("accessToken");
      await api.delete(`/employee/employment/status/${id}`,{
          headers: { Authorization: `Bearer ${token}` },
        });
      await get().fetchEmploymentStatuses();
    } catch (err) {
      console.error(`Error deleting employment status id=${id}:`, err);
    }
  },
}));