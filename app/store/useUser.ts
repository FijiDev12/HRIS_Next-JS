"use client";

import { create } from "zustand";
import api from "@/app/api/withoutAuth/route";
// import { useEmployeeStore } from "@/app/store/useEmployeeInfo";

export interface User {
  id: number;
  email: string;
  roleId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserPayload {
  id: number;
  email: string;
  password: string;
  roleId: number;
}

interface UserState {
  users: User[];
  user: User | null;
  loading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<void>;
  createUser: (payload: CreateUserPayload) => Promise<void>;
  updateUser: (payload: UpdateUserPayload) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}
//   const { employee } = useEmployeeStore();
export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  user: null,
  loading: false,
  error: null,

  /* ===============================
     FETCH ALL USERS
  =============================== */
  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem("accessToken");

      const res = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        users: res.data.data || res.data || [],
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch users",
      });
    }
  },

  /* ===============================
     FETCH USER BY ID
  =============================== */
  fetchUserById: async (id: number) => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem("accessToken");

      const res = await api.get(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        user: res.data.data || res.data || null,
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch user",
      });
    }
  },

  /* ===============================
     CREATE USER
  =============================== */
    createUser: async (payload) => {
    try {
        set({ loading: true, error: null });

        const token = localStorage.getItem("accessToken");

        // 🔥 Construct payload inside the function
        const requestBody = {
        email: payload.email,
        password: "password123", // default password
        roleId: 2,
        };

        await api.post("/users", requestBody, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        });

        await get().fetchUsers(); 

        set({ loading: false });
    } catch (err: any) {
        set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create user",
        });
    }
    },

  /* ===============================
     UPDATE USER
  =============================== */
  updateUser: async (payload) => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem("accessToken");

      await api.patch(`/users/${payload.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchUsers();

      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to update user",
      });
    }
  },

  /* ===============================
     DELETE USER
  =============================== */
  deleteUser: async (id: number) => {
    try {
      set({ loading: true, error: null });

      const token = localStorage.getItem("accessToken");

      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await get().fetchUsers();

      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to delete user",
      });
    }
  },
}));