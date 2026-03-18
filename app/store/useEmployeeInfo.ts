"use client";

import { create } from "zustand";
import api from "@/app/lib/api";

export interface Employee {
  role: any;
  id: number;
  employeeNo: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  gender: string | null;
  birthDate: string;
  civilStatus: string;
  nationality: string;
  address: string | null;
  email: string;
  contactNo: string;
  profilePhoto: string | null;
  positionId: number;
  departmentId: number;
  siteId: number;
  employmentId: number;
  dateHired: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: number;
}

interface EmployeeState {
  employee: Employee | null;
  loading: boolean;
  error: string | null;

  fetchEmployee: (
    id: number,
    token: string,
    onErrorNavigate?: () => void
  ) => Promise<void>;

  clearError: () => void;
  clearEmployee: () => void;
}

export const useEmployeeInfoStore = create<EmployeeState>((set) => ({
  employee: null,
  loading: false,
  error: null,

  fetchEmployee: async (id, token, onErrorNavigate) => {
    console.log(token)
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/employee/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ employee: res.data.data, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message || "Failed to fetch employee details",
      });

      // Call the error callback if provided
      if (onErrorNavigate) onErrorNavigate();
    }
  },

  clearError: () => set({ error: null }),
  clearEmployee: () => set({ employee: null }),
}));
