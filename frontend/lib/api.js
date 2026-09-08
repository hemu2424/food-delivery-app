"use-client"
import axios from "axios";

const api = axios.create({
    baseURL:process.env.NEXT_PUBLIC_API_URL ,
    withCredentials: true
})

export function getInvoiceUrl(orderId) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return `${apiBase}/orders/${orderId}/invoice`;
}

export default api;