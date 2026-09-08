"use client";

import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAdmin } from "@/context/AdminContext";

export default function AdminDashboardPage() {
  const { stats, statsLoading, fetchStats } = useAdmin();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {statsLoading && <p className="text-gray-400">Loading stats...</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>
    </ProtectedRoute>
  );
}