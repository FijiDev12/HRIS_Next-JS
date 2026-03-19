"use client";

import { create } from "zustand";
import axios from "axios";

interface Department {
  id: number;
  departmentName: string;
  siteId: number;
  createdBy: number;
  data?: {
    createdAt: string;
    createdBy: number;
    deletedAt: string | null;
    departmentName?: string;
    id: number;
    siteId: number;
    updatedAt: string;
  };
}

interface DepartmentStore {
  departments: Department[];
  department: Department | null;
  fetchDepartments: () => Promise<void>;
  fetchDepartmentById: (id: number) => Promise<void>;
  addDepartment: (data: Partial<Department>) => Promise<void>;
  updateDepartment: (id: number, data: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: number) => Promise<void>;
}

export const useDepartmentStore = create<DepartmentStore>((set, get) => ({
  departments: [],
  department: null, // ✅ added default value

  fetchDepartments: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("https://chsi-prisma.onrender.com/api/v1/department", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ departments: res.data.data || res.data });
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  },

  fetchDepartmentById: async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `https://chsi-prisma.onrender.com/api/v1/department/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // ✅ set the fetched department in state
      set({ department: res.data.data || res.data });
    } catch (error) {
      console.error("Failed to fetch department by id:", error);
    }
  },

  addDepartment: async (data) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        "https://chsi-prisma.onrender.com/api/v1/department",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // ✅ update the departments list with new department
      set({ departments: [...get().departments, res.data.data || res.data] });
    } catch (error) {
      console.error("Failed to add department:", error);
    }
  },

  updateDepartment: async (id, data) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.patch(
        `https://chsi-prisma.onrender.com/api/v1/department/${id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // ✅ update the departments list with updated department
      set({
        departments: get().departments.map((dept) =>
          dept.id === id ? res.data.data || res.data : dept
        ),
      });
      // ✅ if the updated department is the currently selected one, update it too
      if (get().department?.id === id) {
        set({ department: res.data.data || res.data });
      }
    } catch (error) {
      console.error("Failed to update department:", error);
    }
  },

  deleteDepartment: async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`https://chsi-prisma.onrender.com/api/v1/department/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // ✅ remove from state after deletion
      set({
        departments: get().departments.filter((dept) => dept.id !== id),
      });
      // ✅ clear selected department if deleted
      if (get().department?.id === id) set({ department: null });
    } catch (error) {
      console.error("Failed to delete department:", error);
    }
  },
}));