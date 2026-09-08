"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRestaurants } from "@/context/RestaurantContext";
import MenuItemList from "@/components/admin/MenuItemList";
import MenuItemForm from "@/components/admin/MenuItemForm";
import { fileUrl } from "@/lib/fileUrl";

export default function AdminRestaurantDetailPage() {
  const [showMenuForm, setShowMenuForm] = useState(false);
  const { id } = useParams();
  const { currentRestaurant, menuItems, detailLoading, detailError, fetchRestaurantById } =
    useRestaurants();

  useEffect(() => {
    fetchRestaurantById(id);
  }, [id, fetchRestaurantById]);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {detailLoading && <p className="text-gray-400">Loading...</p>}
      {detailError && <p className="text-red-600">{detailError}</p>}

      {currentRestaurant && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{currentRestaurant.name}</h1>
            <p className="text-gray-500">{currentRestaurant.cuisine}</p>
            {currentRestaurant.video && (
              <video
                src={currentRestaurant.video}
                controls
                className="w-full max-w-xs mt-3 rounded-md"
              />
            )}
          </div>

          <div className="mb-6">
  <button
    onClick={() => setShowMenuForm(true)}
    className="px-4 py-2 bg-orange-500 text-white rounded-md"
  >
    Create Menu
  </button>

  {showMenuForm && (
    <div className="mt-4">
      <MenuItemForm
        restaurantId={id}
        onSuccess={() => {
          fetchRestaurantById(id);
          setShowMenuForm(false);
        }}
      />
    </div>
  )}
</div>

          <h2 className="text-lg font-semibold mb-3">Menu Items</h2>
          <MenuItemList menuItems={menuItems} onChanged={() => fetchRestaurantById(id)} />
        </>
      )}
    </ProtectedRoute>
  );
}