"use client";

import { create } from "zustand";
import api from "@/app/api/withoutAuth/route";

export interface AttendanceCorrection {
  id: number;
  employeeId: number;
  employeeNo?: number;
  type: "IN" | "OUT";
  logDate: string;
  shiftId: number;
  correctedTime: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdBy: number;
  approverId: number | null;
  approvedAt: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;

  employee?: {
    id: number;
    employeeNo: number;
    firstName: string;
    lastName: string;
    birthDate: string;
    email: string;
  };

  shift?: {
    id: number;
    shiftName: string;
    startTime: string;
    endTime: string;
  };
}

export interface CreateAttendanceCorrectionPayload {
  employeeNo: any;
  employeeId: number;
  type: "IN" | "OUT";
  logDate: string;
  shiftId: number;
  correctedTime: string;
  reason: string;
  createdBy: number;
}

export interface ApproveAttendanceCorrectionPayload {
  correctionId: number;
  approverId: number;
  remarks: string;
}
export interface RejectAttendanceCorrectionPayload {
  correctionId: number;
  approverId: number;
  remarks: string;
}

interface AttendanceCorrectionState {
  attendanceCorrections: AttendanceCorrection[];
  attendanceCorrection: AttendanceCorrection | null;
  loading: boolean;
  error: string | null;

  fetchAttendanceCorrections: (userId?: number) => Promise<void>;
  fetchAttendanceCorrectionByEmpId: (id: number) => Promise<void>;
  createAttendanceCorrection: (
    payload: CreateAttendanceCorrectionPayload
  ) => Promise<void>;
  approveAttendanceCorrection: (
    payload: ApproveAttendanceCorrectionPayload
  ) => Promise<void>;
  rejectAttendanceCorrection: (
    payload: RejectAttendanceCorrectionPayload
  ) => Promise<void>;
}

export const useAttendanceCorrectionStore =
  create<AttendanceCorrectionState>((set, get) => ({
    attendanceCorrections: [],
    attendanceCorrection: null,
    loading: false,
    error: null,

    /* ===============================
       FETCH ALL OR BY USER
       If userId is provided, fetch only that user’s corrections
    =============================== */
    fetchAttendanceCorrections: async (userId?: number) => {
      try {
        set({ loading: true, error: null });
        const token = localStorage.getItem("accessToken");

        let url = "/employee/attendance/correction";
        if (userId) url += `/${userId}`;

        const res = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
          set({
            attendanceCorrections: Array.isArray(res.data.data) ? res.data.data : [res.data.data],
            loading: false,
          });
      } catch (err: any) {
        set({
          loading: false,
          error:
            err?.response?.data?.message ||
            "Failed to fetch attendance corrections",
        });
      }
    },

    /* ===============================
       FETCH SINGLE CORRECTION BY ID
    =============================== */
    fetchAttendanceCorrectionByEmpId: async (id) => {
      try {
        set({ loading: true, error: null });
        const token = localStorage.getItem("accessToken");
        
        const res = await api.get(`/employee/attendance/correction/employee/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
          
        set({
          attendanceCorrections: Array.isArray(res.data.data) ? res.data.data : [res.data.data],
          loading: false,
        });
      } catch (err: any) {
        set({
          loading: false,
          error:
            err?.response?.data?.message || "Failed to fetch correction",
        });
      }
    },

    /* ===============================
       CREATE
       Automatically refetch corrections based on role
    =============================== */
    createAttendanceCorrection: async (payload) => {
      try {
        set({ loading: true, error: null });
        const token = localStorage.getItem("accessToken");

        await api.post("/employee/attendance/correction", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Check session role
        const storedUser = localStorage.getItem("user");
        const roleId = storedUser ? JSON.parse(storedUser).roleId : 0;

        if (roleId === 1) {
          await get().fetchAttendanceCorrections(); // fetch all
        } else {
          await get().fetchAttendanceCorrections(payload.employeeId); // fetch only user
        }

        set({ loading: false });
      } catch (err: any) {
        set({
          loading: false,
          error:
            err?.response?.data?.message ||
            "Failed to create attendance correction",
        });
      }
    },

    /* ===============================
       APPROVE
       Refetch corrections based on role
    =============================== */
    approveAttendanceCorrection: async (payload) => {
      try {
        set({ loading: true, error: null });
        const token = localStorage.getItem("accessToken");

        await api.post(
          "/employee/attendance/correction/approve",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const storedUser = localStorage.getItem("user");
        const roleId = storedUser ? JSON.parse(storedUser).roleId : 0;

        if (roleId === 1) {
          await get().fetchAttendanceCorrections();
        } else {
          await get().fetchAttendanceCorrections(payload.approverId);
        }

        set({ loading: false });
      } catch (err: any) {
        set({
          loading: false,
          error:
            err?.response?.data?.message ||
            "Failed to approve attendance correction",
        });
      }
    },

    /* ===============================
       REJECT
       Refetch corrections based on role
    =============================== */
    rejectAttendanceCorrection: async (payload) => {
      try {
        set({ loading: true, error: null });
        const token = localStorage.getItem("accessToken");

        await api.post(
          "/employee/attendance/correction/reject",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const storedUser = localStorage.getItem("user");
        const roleId = storedUser ? JSON.parse(storedUser).roleId : 0;

        if (roleId === 1) {
          await get().fetchAttendanceCorrections();
        } else {
          await get().fetchAttendanceCorrections(payload.approverId);
        }

        set({ loading: false });
      } catch (err: any) {
        set({
          loading: false,
          error:
            err?.response?.data?.message ||
            "Failed to reject attendance correction",
        });
      }
    },
  }));