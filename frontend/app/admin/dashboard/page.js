"use client";

import { useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAdmin } from "@/context/AdminContext";
import { useOrderStatusListener } from "@/hooks/useOrderStatusListener";
import { useOrderCreatedListener } from "@/hooks/useOrderCreatedListener";

export default function AdminDashboardPage() {
  const { stats, statsLoading, fetchStats } = useAdmin();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleOrderEvent = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  useOrderStatusListener(handleOrderEvent);
  useOrderCreatedListener(handleOrderEvent);

  const cards = stats
    ? [
        { label: "Customers", value: stats.totalCustomers },
        { label: "Delivery Partners", value: stats.totalDeliveryPartners },
        { label: "Restaurants", value: stats.totalRestaurants },
        { label: "Total Orders", value: stats.totalOrders },
        { label: "Revenue (Delivered)", value: `₹${stats.totalRevenue}` },
      ]
    : [];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="app-shell">
        <div className="mb-6">
          <span className="eyebrow">Operations</span>
          <h1 className="mt-4 section-title">Admin Dashboard</h1>
        </div>

        {statsLoading && <p className="text-sm text-slate-500">Loading stats...</p>}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {cards.map((card) => (
            <div key={card.label} className="surface-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}