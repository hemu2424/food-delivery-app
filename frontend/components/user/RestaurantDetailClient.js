"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import MenuItemCard from "@/components/user/MenuItemCard";
import { useCart } from "@/context/CartContext";
import { groupByCategory } from "@/lib/groupByCategory";

export default function RestaurantDetailClient({ restaurantId, restaurant, initialMenuItems }) {
  const { addItem } = useCart();

  function handleAddToCart(menuItem) {
    addItem(restaurantId, restaurant.name, menuItem);
  }

  const groupedMenu = groupByCategory(initialMenuItems);
  const categories = Object.keys(groupedMenu);

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-500">{restaurant.cuisine}</p>
      </div>

      {initialMenuItems.length === 0 && (
        <p className="text-gray-400">This restaurant hasn&apos;t added any menu items yet.</p>
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
    </ProtectedRoute>
  );
}