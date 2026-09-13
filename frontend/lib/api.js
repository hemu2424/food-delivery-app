"use client"
import axios from "axios";

const defaultApiBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: defaultApiBase,
  withCredentials: true,
});

export function getInvoiceUrl(orderId) {
  return `${defaultApiBase}/orders/${orderId}/invoice`;
}

export default api;