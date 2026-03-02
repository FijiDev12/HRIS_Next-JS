"use client";

import { create } from "zustand";
import api from "@/app/api/withoutAuth/route";
import { toast } from "react-toastify";

export interface Timelog {
  [x: string]: any;
  logDate: any;
  type: string;
  loggedAt: string;
  workDate: any;
  timeIn: string;
  timeOut: string;
  status: string;
  breaks: string;
  date: string;
  id: number;
  employeeNo: number;
  selfieUrl?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceCorrection {
  id?: number;
  employeeNo: number;
  type: string;
  logDate: string;
  shiftId: number;
  correctedTime: string;
  reason: string;
  createdBy: number;
}

export interface ApprovalPayload {
  correctionId: number;
  approverId: number;
  remarks: string;
}

interface TimelogState {
  timelogs: Timelog[];
  loading: boolean;
  error: string | null;

  postTimelog: (
    employeeNo: number,
    selfieFile: File,
    latitude: number,
    longitude: number
  ) => Promise<void>;

  getDTR: (employeeId: number, startDate: string, endDate: string) => Promise<Timelog[]>;

  postAttendanceCorrection: (payload: AttendanceCorrection) => Promise<void>;
  approveAttendanceCorrection: (payload: ApprovalPayload) => Promise<void>;

  clearError: () => void;
  clearTimelogs: () => void;

  getTimelogsBySite: (siteId: number, dateFrom: string, dateTo: string) => Promise<Timelog[]>;
}

export const useTimelogStore = create<TimelogState>((set, get) => ({
  timelogs: [],
  loading: false,
  error: null,

  /* ===== POST TIMELOG ===== */
  postTimelog: async (employeeNo, selfieFile, latitude, longitude) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      const formData = new FormData();
      formData.append("selfie", selfieFile);
      formData.append("employeeNo", employeeNo.toString());
      formData.append("latitude", latitude.toString());
      formData.append("longitude", longitude.toString());

      const res = await api.post("/timelogs", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      console.log('object: ', res)

      toast.success(res.data?.data?.message || "Timelog posted successfully");

      set({ timelogs: [...get().timelogs, res.data.data || res.data], loading: false });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to post timelog";
      toast.error(errorMsg);
      set({ loading: false, error: errorMsg });
    }
  },

  /* ===== GET DTR ===== */
  getDTR: async (employeeId, startDate, endDate) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      const res = await api.get("/dtr", {
        params: { employeeId, startDate, endDate },
        headers: { Authorization: `Bearer ${token}` },
      });

      const logs: Timelog[] = res.data?.data || res.data || [];
      set({ timelogs: logs, loading: false });
      return logs;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch DTR";
      toast.error(errorMsg);
      set({ loading: false, error: errorMsg });
      return [];
    }
  },

  /* ===== GET TIMELOGS BY SITE ===== */
  getTimelogsBySite: async (siteId, dateFrom, dateTo) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      const res = await api.get(`/timelogs/site/${siteId}`, {
        params: { dateFrom, dateTo },
        headers: { Authorization: `Bearer ${token}` },
      });

      const logs: Timelog[] = res.data?.data || res.data || [];
      set({ timelogs: logs, loading: false });
      return logs;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch timelogs by site";
      toast.error(errorMsg);
      set({ loading: false, error: errorMsg });
      return [];
    }
  },

  /* ===== POST ATTENDANCE CORRECTION ===== */
  postAttendanceCorrection: async (payload: AttendanceCorrection) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      const res = await api.post("/employee/attendance-correction", payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      toast.success(res.data?.message || "Attendance correction submitted");
      set({ loading: false });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to submit correction";
      toast.error(errorMsg);
      set({ loading: false, error: errorMsg });
    }
  },

  /* ===== APPROVE ATTENDANCE CORRECTION ===== */
  approveAttendanceCorrection: async (payload: ApprovalPayload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      const res = await api.post("/employee/attendance-correction/approve", payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      toast.success(res.data?.message || "Attendance correction processed");
      set({ loading: false });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to approve correction";
      toast.error(errorMsg);
      set({ loading: false, error: errorMsg });
    }
  },

  clearError: () => set({ error: null }),
  clearTimelogs: () => set({ timelogs: [] }),
}));