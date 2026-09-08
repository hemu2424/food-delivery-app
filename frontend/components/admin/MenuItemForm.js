"use client";

import { useState } from "react";
import { useMenuItems } from "@/context/MenuItemContext";
import ImageUploader from "@/components/shared/ImageUploader";
import { useToast } from "@/context/ToastContext";

// If `menuItem` is passed in, this form operates in EDIT mode.
// If not, CREATE mode — same as RestaurantForm's pattern.
export default function MenuItemForm({ restaurantId, menuItem, onSuccess }) {
  const { createMenuItem, updateMenuItem } = useMenuItems();
  const { showToast } = useToast();
  const isEditMode = Boolean(menuItem);

  const [formData, setFormData] = useState({
    name: menuItem?.name || "",
    price: menuItem?.price || "",
    category: menuItem?.category || "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
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
      if (!isEditMode) {
        data.append("restaurant", restaurantId); // only needed when creating
      }
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("category", formData.category);
      selectedImages.forEach((file) => data.append("images", file));

      if (isEditMode) {
        await updateMenuItem(menuItem._id, data);
        showToast("Menu item updated!");
      } else {
        await createMenuItem(data);
        showToast("Menu item added!");
      }

      if (!isEditMode) {
        setFormData({ name: "", price: "", category: "" });
      }
      setSelectedImages([]);
      onSuccess?.();
    } catch (err) {
      const message = err.response?.data?.message || `Could not ${isEditMode ? "update" : "add"} menu item.`;
      setError(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input
          name="name"
          required
          placeholder="Item name"
          value={formData.name}
          onChange={handleTextChange}
          className="border rounded-md px-3 py-2 text-sm"
        />
        <input
          name="price"
          required
          type="number"
          min="0"
          placeholder="Price"
          value={formData.price}
          onChange={handleTextChange}
          className="border rounded-md px-3 py-2 text-sm w-24"
        />
        <input
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleTextChange}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <ImageUploader label={isEditMode ? "Add More Images" : "Item Images"} maxCount={5} onChange={setSelectedImages} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Item"}
      </button>
    </form>
  );
}