"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import RestaurantList from "@/components/admin/RestaurantList";


const RestaurantForm = dynamic(() => import("@/components/admin/RestaurantForm"), {
  loading: () => (
    <div className="bg-white border rounded-xl p-6 mb-6 max-w-2xl mx-auto text-gray-400 text-sm">
      Loading form...
    </div>
  ),
});

export default function AdminRestaurantsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Restaurants</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {showForm ? "Cancel" : "+ Add Restaurant"}
        </button>
      </div>

      {showForm && <RestaurantForm onSuccess={() => setShowForm(false)} />}

      <RestaurantList />
    </ProtectedRoute>
  );
}