"use client"
import axios from "axios";

const defaultApiBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: defaultApiBase,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function getInvoiceUrl(orderId) {
  return `${defaultApiBase}/orders/${orderId}/invoice`;
}

export default api;