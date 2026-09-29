"use client";

import { useState } from "react";
import { useMenuItems } from "@/context/MenuItemContext";
import ImageUploader from "@/components/shared/ImageUploader";
import { useToast } from "@/context/ToastContext";

export default function MenuItemForm({ restaurantId, menuItem, onSuccess }) {
  const { createMenuItem, updateMenuItem } = useMenuItems();
  const { showToast } = useToast();
  const isEditMode = Boolean(menuItem);

  const [formData, setFormData] = useState({
    name: menuItem?.name || "",
    price: menuItem?.price !== undefined ? menuItem.price : "",
    category: menuItem?.category || "",
    description: menuItem?.description || "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTextChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = new FormData();
      if (!isEditMode) {
        data.append("restaurant", restaurantId);
      }
      data.append("name", formData.name.trim());
      data.append("price", String(formData.price));
      data.append("category", formData.category.trim() || "General");
      data.append("description", formData.description.trim());

      selectedImages.forEach((file) => data.append("images", file));

      if (isEditMode) {
        await updateMenuItem(menuItem._id, data);
        showToast("Menu item updated successfully!");
      } else {
        await createMenuItem(data);
        showToast("Menu item added successfully!");
      }

      if (!isEditMode) {
        setFormData({ name: "", price: "", category: "", description: "" });
      }
      setSelectedImages([]);
      onSuccess?.();
    } catch (err) {
      console.error("Menu item form error:", err);
      const message =
        err.response?.data?.message ||
        `Could not ${isEditMode ? "update" : "add"} menu item.`;
      setError(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 p-4 rounded-lg border">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="e.g. Margherita Pizza"
            value={formData.name}
            onChange={handleTextChange}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            name="price"
            required
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={formData.price}
            onChange={handleTextChange}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Category
          </label>
          <input
            name="category"
            placeholder="e.g. Starters, Main Course"
            value={formData.category}
            onChange={handleTextChange}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Description (optional)
        </label>
        <textarea
          name="description"
          placeholder="Brief description of the item"
          value={formData.description}
          onChange={handleTextChange}
          rows={2}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
        />
      </div>

      <ImageUploader
        label={isEditMode ? "Add More Images" : "Item Images (up to 5)"}
        maxCount={5}
        onChange={setSelectedImages}
      />

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Save Changes"
            : "Add Menu Item"}
        </button>
      </div>
    </form>
  );
}