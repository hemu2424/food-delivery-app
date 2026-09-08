"use client";

import { useState } from "react";
import Image from "next/image";
import { useMenuItems } from "@/context/MenuItemContext";
import { fileUrl } from "@/lib/fileUrl";
import MenuItemForm from "./MenuItemForm";

export default function MenuItemList({ menuItems, onChanged }) {
  const { deleteMenuItem, deleteMenuItemImage } = useMenuItems();
  const [editingItemId, setEditingItemId] = useState(null);

  async function handleDeleteItem(id) {
    if (!confirm("Delete this menu item?")) return;
    await deleteMenuItem(id);
    onChanged?.();
  }

  async function handleDeleteImage(itemId, imagePath) {
    await deleteMenuItemImage(itemId, imagePath);
    onChanged?.();
  }

  function handleEditSuccess() {
    setEditingItemId(null);
    onChanged?.();
  }

  if (menuItems.length === 0) {
    return <p className="text-gray-400">No menu items yet.</p>;
  }

  return (
    <div className="space-y-3">
      {menuItems.map((item) => (
        <div key={item._id} className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{item.category}</p>
              <p className="text-sm font-semibold text-orange-600">₹{item.price}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingItemId(editingItemId === item._id ? null : item._id)}
                className="text-sm border px-3 py-1.5 rounded-md"
              >
                {editingItemId === item._id ? "Close" : "Edit"}
              </button>
              <button
                onClick={() => handleDeleteItem(item._id)}
                className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>

          {item.images?.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {item.images.map((img) => (
                <div key={img} className="relative w-16 h-16">
                  <Image
                    src={img}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover rounded-md border"
                  />
                  <button
                    onClick={() => handleDeleteImage(item._id, img)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs z-10"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {editingItemId === item._id && (
            <div className="mt-4 pt-4 border-t">
              <MenuItemForm key={item._id} menuItem={item} onSuccess={handleEditSuccess} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}