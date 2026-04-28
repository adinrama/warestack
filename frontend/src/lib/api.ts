import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
});

// Attach JWT token from NextAuth session to every request
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.backendToken) {
    config.headers.Authorization = `Bearer ${session.backendToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;

// ── Product API ────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get("/api/products", { params }),
  getOne: (id: string) => api.get(`/api/products/${id}`),
  create: (data: unknown) => api.post("/api/products", data),
  update: (id: string, data: unknown) => api.put(`/api/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
};

// ── Team API ───────────────────────────────────────────────────────────
export const teamApi = {
  getMembers: () => api.get("/api/team/members"),
  getAvailableStaff: () => api.get("/api/team/available-staff"),
  assign: (data: unknown) => api.post("/api/team/assign", data),
  remove: (staffId: string) => api.delete(`/api/team/remove/${staffId}`),
};
