"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import MenuItemCard from "@/components/user/MenuItemCard";
import { useRestaurants } from "@/context/RestaurantContext";
import { useCart } from "@/context/CartContext";
import { groupByCategory } from "@/lib/groupByCategory";

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const { currentRestaurant, menuItems, detailLoading, detailError, fetchRestaurantById } =
    useRestaurants();
  const { addItem } = useCart();

  useEffect(() => {
    fetchRestaurantById(id);
  }, [id, fetchRestaurantById]);

  function handleAddToCart(menuItem) {
    addItem(id, currentRestaurant.name, menuItem);
  }

  const groupedMenu = groupByCategory(menuItems);
  const categories = Object.keys(groupedMenu); 

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      {detailLoading && <p className="text-gray-400">Loading menu...</p>}
      {detailError && <p className="text-red-600">{detailError}</p>}

      {currentRestaurant && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{currentRestaurant.name}</h1>
            <p className="text-gray-500">{currentRestaurant.cuisine}</p>
          </div>

          {menuItems.length === 0 && (
            <p className="text-gray-400">This restaurant hasn't added any menu items yet.</p>
          )}

          {categories.map((category) => (
            <div key={category} className="mb-8">
              <h2 className="text-lg font-semibold mb-3 pb-2 border-b">{category}</h2>
              <div className="space-y-3">
                {groupedMenu[category].map((item) => (
                  <MenuItemCard key={item._id} item={item} onAdd={handleAddToCart} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </ProtectedRoute>
  );
}