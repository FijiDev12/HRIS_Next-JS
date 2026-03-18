"use client";
import imageCompression from "browser-image-compression";
import { create } from "zustand";
import api from "@/app/lib/api";

/* =========================
   Types
========================= */

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  address: string;
  email: string;
  contactNo: string;
  positionId: number;
  departmentId: number;
  siteId: number;
  employmentId: number;
  dateHired: string;
}

export interface EmployeeShift {
  workDate: string | number | Date;
  shift: any;
  id: number;
  employeeId: number;
  employeeName: string;
  shiftId: number;
  shiftName: string;
  startDate: string;
  endDate: string;
}
interface BulkUploadResponse {
  code: number;
  message: string;
  data: {
    successCount: number;
    errorCount: number;
    createdEmployees: Array<{ id: number; firstName: string; lastName: string; email: string }>;
    errors: Array<{ email: string; message: string }>;
  };
}
interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  birthDate: string;
  address: string;
  email: string;
  contactNo: string;
  positionId: number;
  departmentId: number;
  siteId: number;
  employmentId: number;
  dateHired: string;
  profilePhoto?: File;
}

interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {}
export interface BulkEmployeeRow {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  gender: "Male" | "Female";
  birthDate: string;       // ISO date string: YYYY-MM-DD
  civilStatus: "single" | "married" | "widowed" | "divorced";
  nationality: string;
  address: string;
  email: string;
  contactNo: string;       // As string, because Prisma expects string
  positionId: number;
  departmentId: number;
  siteId: number;
  employmentId?: number;   // optional if some rows can have NaN
  dateHired: string;       // ISO date string: YYYY-MM-DD
  basicSalary?: number;    // optional
}

// Payload interface for sending to the API
export interface BulkUploadEmployeePayload {
  file: File;  // the CSV/Excel file
  // optionally, you can add metadata like uploaderId or other info
  uploaderId?: number;
}
/* =========================
   State Interface
========================= */

interface EmployeeState {
  employees: Employee[];
  employeeShifts: EmployeeShift[];

  loading: boolean;
  error: string | null;

  // APIs
  fetchEmployees: () => Promise<void>;
  fetchEmployeeById: (id: number) => Promise<Employee | null>; // ✅ NEW
  createEmployee: (payload: CreateEmployeePayload) => Promise<void>;
  updateEmployee: (id: number, payload: UpdateEmployeePayload) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
// In EmployeeState
bulkUploadEmployees: (file: File) => Promise<BulkUploadResponse["data"]>;

  assignShift: (payload: {
    employeeId: number;
    shiftId: number;
    startDate: string;
    endDate: string;
  }) => Promise<void>;
  getAssignShiftByEmpId: (id?: number) => Promise<void>;

  fetchEmployeeShifts: () => Promise<void>;

  // Utils
  clearError: () => void;
}

/* =========================
   Store
========================= */

const formatDate = (dateString: string | number | Date) => {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  employeeShifts: [],
  loading: false,
  error: null,

  /* ===== FETCH EMPLOYEES ===== */
  fetchEmployees: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const res = await api.get("/employee", {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ employees: Array.isArray(res.data.data) ? res.data.data : [res.data.data], loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch employees",
      });
    }
  },

  /* ===== FETCH SINGLE EMPLOYEE ===== */
  fetchEmployeeById: async (id) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const res = await api.get(`/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ loading: false });
      return res.data.data; // returns the employee object
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch employee",
      });
      return null;
    }
  },

  /* ===== CREATE EMPLOYEES ===== */
  createEmployee: async (payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const formData = new FormData();
      formData.append("firstName", payload.firstName);
      formData.append("lastName", payload.lastName);
      formData.append("birthDate", formatDate(payload.birthDate));
      formData.append("address", payload.address);
      formData.append("email", payload.email);
      formData.append("contactNo", payload.contactNo);
      formData.append("positionId", String(payload.positionId));
      formData.append("departmentId", String(payload.departmentId));
      formData.append("siteId", String(payload.siteId));
      formData.append("employmentId", String(payload.employmentId) || "1");
      formData.append("dateHired", formatDate(payload.dateHired));

      if (payload.profilePhoto) {
        formData.append("profilePhoto", payload.profilePhoto, payload.profilePhoto.name);
      }

      await api.post("/employee", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await get().fetchEmployees();
      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to create employee",
      });
    }
  },

  /* ===== UPDATE EMPLOYEES ===== */
  updateEmployee: async (id, payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const formData = new FormData();

      if (payload.firstName !== undefined) formData.append("firstName", payload.firstName);
      if (payload.lastName !== undefined) formData.append("lastName", payload.lastName);
      if (payload.birthDate !== undefined) formData.append("birthDate", formatDate(payload.birthDate));
      if (payload.email !== undefined) formData.append("email", payload.email);
      if (payload.contactNo !== undefined) formData.append("contactNo", payload.contactNo);
      if (payload.positionId !== undefined) formData.append("positionId", String(payload.positionId));
      if (payload.departmentId !== undefined) formData.append("departmentId", String(payload.departmentId));
      if (payload.siteId !== undefined) formData.append("siteId", String(payload.siteId));
      if (payload.employmentId !== undefined) formData.append("employmentId", String(payload.employmentId));
      if (payload.dateHired !== undefined) formData.append("dateHired", formatDate(payload.dateHired));
      if (payload.address !== undefined) formData.append("address", payload.address);

      if (payload.profilePhoto) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1024 };
        const compressedFile = await imageCompression(payload.profilePhoto, options);
        formData.append("profilePhoto", compressedFile);
      }

      await api.patch(`/employee/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await get().fetchEmployees();
      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to update employee",
      });
    }
  },

  /* ===== DELETE EMPLOYEE ===== */
  deleteEmployee: async (id) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      await api.delete(`/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await get().fetchEmployees();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to delete employee",
      });
    }
  },

  /* ===== ASSIGN SHIFT ===== */
  assignShift: async (payload) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      await api.post("/employee/assign/schedule", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await get().fetchEmployeeShifts();
      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to assign shift",
      });
    }
  },

  /* ===== FETCH EMPLOYEE SHIFTS ===== */
  fetchEmployeeShifts: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";

      const res = await api.get("/employee/assign/schedule", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res)
      set({ employeeShifts: res.data.data, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch employee shifts",
      });
    }
  },
  /* ===== ASSIGN SHIFT BY ID ===== */
  getAssignShiftByEmpId: async (id) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("accessToken") || "";
      // Use employeeId in the URL
      const res = await api.get(
        `/employee/assign/schedule/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the store with the returned schedule data
      if (res.data?.data) {
        set((state) => ({
          employeeShifts: [...state.employeeShifts, ...res.data.data],
          loading: false,
        }));
      } else {
        set({ loading: false });
      }
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to assign shift",
      });
    }
  },
  /* ===== BULK UPLOAD EMPLOYEES ===== */
bulkUploadEmployees: async (file: File) => {
  try {
    set({ loading: true, error: null });
    const token = localStorage.getItem("accessToken") || "";

    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<BulkUploadResponse>("/employee/bulk-upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    await get().fetchEmployees();
    set({ loading: false });

    return res.data.data; // ✅ return the response data
  } catch (err: any) {
    set({
      loading: false,
      error: err?.response?.data?.message || "Failed to bulk upload employees",
    });
    throw err;
  }
},

  clearError: () => set({ error: null }),
}));