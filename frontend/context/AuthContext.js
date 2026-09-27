"use client"

import api, { clearAuthToken, saveAuthToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isActive = true;
    async function checkAuth() {
      try {
        const response = await api.get("/auth/me");
        if (isActive) setUser(response.data.user ?? response.data);
      } catch (error) {
        if (isActive) setUser(null);
      } finally {
        if (isActive) setLoading(false);
      }
    }
    checkAuth();
    return () => { isActive = false; };
  }, []);

  const redirectByRole = useCallback((role) => {
    const target = role === "admin"
      ? "/admin/dashboard"
      : role === "delivery"
        ? "/delivery/dashboard"
        : "/user/dashboard";
    const currentPath = window.location.pathname;
    if (currentPath !== target) router.replace(target);
  }, [router]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      saveAuthToken(response.data.token);
      setUser(response.data.user);
      redirectByRole(response.data.user.role);
      return response.data.user;
    } catch (error) {
      if (error.response?.data?.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(error.response.data.email)}`);
      }
      throw error;
    }
  }, [redirectByRole, router]);

  const verifyEmail = useCallback(async (email, otp) => {
    const response = await api.post("/auth/verify-email", { email, otp });
    saveAuthToken(response.data.token);
    setUser(response.data.user);
    redirectByRole(response.data.user.role);
    return response.data.user;
  }, [redirectByRole]);

  const resendOtp = useCallback(async (email) => {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  }, []);

  const register = useCallback(async (formData) => {
    const response = await api.post("/auth/register", formData);
    router.push(`/verify-email?email=${encodeURIComponent(response.data.email)}`);
    return response.data;
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      clearAuthToken();
      setUser(null);
      router.replace("/login");
    }
  }, [router]);

  const forgotPassword = useCallback(async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  }, []);

  const resetPassword = useCallback(async (email, otp, newPassword) => {
    const response = await api.post("/auth/reset-password", { email, otp, newPassword });
    return response.data;
  }, []);

  const updateProfile = useCallback(async (formData) => {
    const response = await api.put("/auth/me", formData);
    setUser(response.data);
    return response.data;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const response = await api.put("/auth/change-password", { currentPassword, newPassword });
    return response.data;
  }, []);

  const value = useMemo(() => ({
    user, loading, register, login, logout, verifyEmail, resendOtp,
    forgotPassword, resetPassword, updateProfile, changePassword
  }), [user, loading, register, login, logout, verifyEmail, resendOtp,
      forgotPassword, resetPassword, updateProfile, changePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}