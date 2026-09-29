// components/admin/RestaurantListItem.js
"use client";

import { memo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRestaurants } from "@/context/RestaurantContext";
import ImageGallery from "@/components/shared/ImageGallery";

const MenuItemForm = dynamic(() => import("./MenuItemForm"), {
  loading: () => <p className="text-gray-400 text-sm">Loading...</p>,
});
const RestaurantForm = dynamic(() => import("./RestaurantForm"), {
  loading: () => <p className="text-gray-400 text-sm">Loading form...</p>,
});

function RestaurantListItem({ restaurant }) {
  const { deleteRestaurant, deleteRestaurantImage } = useRestaurants();
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    if (!confirm(`Delete "${restaurant.name}" and all its menu items?`)) return;
    await deleteRestaurant(restaurant._id);
  }

  async function handleDeleteImage(imagePath) {
    await deleteRestaurantImage(restaurant._id, imagePath);
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/admin/restaurants/${restaurant._id}`} className="block hover:opacity-80">
        <p className="font-semibold text-gray-900 text-lg">{restaurant.name}</p>
        <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
        {restaurant.address && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">📍 {restaurant.address}</p>
        )}
      </Link>

      <div className="flex gap-2 mt-3 flex-wrap">
        <button
          type="button"
          onClick={() => setShowEditForm(!showEditForm)}
          className="text-xs border px-3 py-1.5 rounded-md hover:bg-gray-50 font-medium"
        >
          {showEditForm ? "Close Edit" : "Edit"}
        </button>
        <button
          type="button"
          onClick={() => setShowMenuForm(!showMenuForm)}
          className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-md hover:bg-orange-100 font-medium"
        >
          {showMenuForm ? "Close Menu Form" : "+ Menu Item"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50 font-medium"
        >
          Delete
        </button>
      </div>

      <ImageGallery images={restaurant.images} onDelete={handleDeleteImage} />

      {restaurant.video && (
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-1">Promo Video:</p>
          <video src={restaurant.video} controls className="w-full max-w-xs rounded-md border" />
        </div>
      )}

      {showEditForm && (
        <div className="mt-4 pt-4 border-t">
          <RestaurantForm key={restaurant._id} restaurant={restaurant} onSuccess={() => setShowEditForm(false)} />
        </div>
      )}

      {showMenuForm && (
        <div className="mt-4 pt-4 border-t">
          <MenuItemForm restaurantId={restaurant._id} onSuccess={() => setShowMenuForm(false)} />
        </div>
      )}
    </div>
  );
}

export default memo(RestaurantListItem);