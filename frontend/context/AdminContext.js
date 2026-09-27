"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user || user.role !== "admin") return;
    setStatsLoading(true);
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  const fetchUsers = useCallback(async () => {
    if (!user || user.role !== "admin") return;
    setLoading(true);
    try {
      const [customersRes, partnersRes] = await Promise.all([
        api.get("/admin/customers"),
        api.get("/admin/delivery-partners"),
      ]);
      setCustomers(customersRes.data);
      setDeliveryPartners(partnersRes.data);
      setError("");
    } catch (err) {
      if (err.response?.status !== 401) setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const toggleBlockUser = useCallback(async (userId) => {
    await api.put(`/admin/users/${userId}/block`);
    await fetchUsers();
  }, [fetchUsers]);

  const approveDeliveryPartner = useCallback(async (partnerId) => {
    await api.put(`/admin/delivery-partners/${partnerId}/approve`);
    await fetchUsers();
  }, [fetchUsers]);

  const value = useMemo(() => ({
    customers, deliveryPartners, loading, error, fetchUsers,
    toggleBlockUser, approveDeliveryPartner, stats, statsLoading, fetchStats
  }), [
    customers, deliveryPartners, loading, error, fetchUsers,
    toggleBlockUser, approveDeliveryPartner, stats, statsLoading, fetchStats
  ]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used inside an AdminProvider");
  return context;
}