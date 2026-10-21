// components/user/RestaurantDetailClient.js
"use client";

import { useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import MenuItemCard from "@/components/user/MenuItemCard";
import { useCart } from "@/context/CartContext";
import { groupByCategory } from "@/lib/groupByCategory";

export default function RestaurantDetailClient({ restaurantId, restaurant, initialMenuItems }) {
  const { addItem } = useCart();

  const handleAddToCart = useCallback(
    (menuItem) => {
      addItem(restaurantId, restaurant.name, menuItem);
    },
    [addItem, restaurantId, restaurant.name]
  );

  const groupedMenu = groupByCategory(initialMenuItems);
  const categories = Object.keys(groupedMenu);

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div className="app-shell">
        <div className="surface-card overflow-hidden">
          <div className="relative h-56 w-full bg-slate-100 sm:h-72">
            {restaurant.images?.[0] ? (
              <img src={restaurant.images[0]} alt={restaurant.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No image</div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/50 via-slate-900/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
                {restaurant.cuisine}
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">{restaurant.name}</h1>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-8">
          {initialMenuItems.length === 0 && (
            <div className="soft-panel p-6 text-sm text-slate-500">This restaurant hasn&apos;t added any menu items yet.</div>
          )}

          {categories.map((category) => (
            <div key={category}>
              <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-lg font-bold text-slate-900">{category}</h2>
              </div>
              <div className="space-y-3">
                {groupedMenu[category].map((item) => (
                  <MenuItemCard key={item._id} item={item} onAdd={handleAddToCart} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}