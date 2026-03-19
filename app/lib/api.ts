// app/lib/api.ts
import axios from "axios";
import { useAuthStore } from "@/app/store/useAuth";

const api = axios.create({
  baseURL: "https://chsi-prisma.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;