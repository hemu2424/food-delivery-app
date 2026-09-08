"use client";

import { useState } from "react";
import { useRestaurants } from "@/context/RestaurantContext";
import ImageUploader from "@/components/shared/ImageUploader";
import VideoUploader from "@/components/shared/videoUploader";
import { useToast } from "@/context/ToastContext";

// If `restaurant` is passed in, this form operates in EDIT mode.
// If not, it operates in CREATE mode. Same fields, same uploaders, different submit action.
export default function RestaurantForm({ restaurant, onSuccess }) {
  const { createRestaurant, updateRestaurant } = useRestaurants();
  const { showToast } = useToast();
  const isEditMode = Boolean(restaurant);

  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    cuisine: restaurant?.cuisine || "",
    description: restaurant?.description || "",
    address: restaurant?.address || "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTextChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("cuisine", formData.cuisine);
      data.append("description", formData.description);
      data.append("address", formData.address);

      // New images ADD to existing ones (your backend already handles this via .push()),
      // new video REPLACES the old one (backend deletes the old file automatically).
      selectedImages.forEach((file) => data.append("images", file));
      if (selectedVideo) {
        data.append("video", selectedVideo);
      }

      if (isEditMode) {
        await updateRestaurant(restaurant._id, data);
        showToast("Restaurant updated!");
      } else {
        await createRestaurant(data);
        showToast("Restaurant created!");
      }

      if (!isEditMode) {
        setFormData({ name: "", cuisine: "", description: "", address: "" });
      }
      setSelectedImages([]);
      setSelectedVideo(null);
      onSuccess?.();
    } catch (err) {
      const message = err.response?.data?.message || `Could not ${isEditMode ? "update" : "create"} restaurant.`;
      setError(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-6 max-w-2xl mx-auto space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input
            name="name"
            required
            placeholder="Restaurant name"
            value={formData.name}
            onChange={handleTextChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cuisine</label>
          <input
            name="cuisine"
            placeholder="e.g. Italian, Chinese"
            value={formData.cuisine}
            onChange={handleTextChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-200"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
          <input
            name="address"
            required
            minLength={5}
            placeholder="Street, City, ZIP"
          value={formData.address}
          onChange={handleTextChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <textarea
          name="description"
          placeholder="Short description"
          value={formData.description}
          onChange={handleTextChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-orange-200"
        />
      </div>

      {isEditMode && restaurant.images?.length > 0 && (
        <p className="text-xs text-gray-500">
          This restaurant already has {restaurant.images.length} image(s). New images you add below will be added alongside them — manage individual images from the restaurant card.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUploader label={isEditMode ? "Add More Images" : "Images (up to 5)"} maxCount={5} onChange={setSelectedImages} />
        <VideoUploader label={isEditMode ? "Replace Video (optional)" : "Promo Video (optional)"} onChange={setSelectedVideo} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium"
        >
          {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Restaurant"}
        </button>
      </div>
    </form>
  );
}
