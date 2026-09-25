"use client"
import axios from "axios";

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const defaultApiBase = rawBaseUrl.replace(/\/+$/, "");
const AUTH_TOKEN_KEY = "food_delivery_auth_token";

// The API may be hosted on a different site from Vercel. In that case browsers
// can block its cross-site cookie, so authenticated requests also use the JWT
// returned by the API in the Authorization header.
export function saveAuthToken(token) {
  if (typeof window !== "undefined" && token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

const api = axios.create({
  baseURL: defaultApiBase,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getInvoiceUrl(orderId) {
  return `${defaultApiBase}/orders/${orderId}/invoice`;
}

export default api;
