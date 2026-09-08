"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRestaurants } from "@/context/RestaurantContext";
import ImageGallery from "@/components/shared/ImageGallery";
import { fileUrl } from "@/lib/fileUrl";

const MenuItemForm = dynamic(() => import("./MenuItemForm"), {
  loading: () => <p className="text-gray-400 text-sm">Loading...</p>,
});
const RestaurantForm = dynamic(() => import("./RestaurantForm"), {
  loading: () => <p className="text-gray-400 text-sm">Loading form...</p>,
});

export default function RestaurantListItem({ restaurant }) {
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
    <div className="bg-white border rounded-lg p-4">
      <Link href={`/admin/restaurants/${restaurant._id}`} className="block hover:opacity-80">
        <p className="font-semibold">{restaurant.name}</p>
        <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
      </Link>

      <div className="flex gap-2 mt-2 flex-wrap">
        <button onClick={() => setShowEditForm(!showEditForm)} className="text-sm border px-3 py-1.5 rounded-md">
          {showEditForm ? "Close" : "Edit"}
        </button>
        <button onClick={() => setShowMenuForm(!showMenuForm)} className="text-sm border px-3 py-1.5 rounded-md">
          {showMenuForm ? "Close" : "+ Menu Item"}
        </button>
        <button onClick={handleDelete} className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-md">
          Delete
        </button>
      </div>

      <ImageGallery images={restaurant.images} onDelete={handleDeleteImage} />

      {restaurant.video && (
        <video src={restaurant.video} controls className="w-full max-w-xs mt-3 rounded-md" />
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