"use client";

import { createContext, useContext, useState, useCallback } from "react";
import api from "@/lib/api";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
const [statsLoading, setStatsLoading] = useState(false);

const fetchStats = useCallback(async () => {
  setStatsLoading(true);
  try {
    const response = await api.get("/admin/stats");
    setStats(response.data);
  } catch (err) {
    console.error(err);
  } finally {
    setStatsLoading(false);
  }
}, []);

  const fetchUsers = useCallback(async () => {
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
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function toggleBlockUser(userId) {
    await api.put(`/admin/users/${userId}/block`);
    await fetchUsers();
  }

  async function approveDeliveryPartner(partnerId) {
    await api.put(`/admin/delivery-partners/${partnerId}/approve`);
    await fetchUsers();
  }

  return (
    <AdminContext.Provider
      value={{ customers, deliveryPartners, loading, error, fetchUsers, toggleBlockUser, approveDeliveryPartner ,stats, statsLoading, fetchStats}}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used inside an AdminProvider");
  }
  return context;
}