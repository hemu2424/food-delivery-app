// components/admin/MenuItemList.js
"use client";

import { useState, useCallback } from "react";
import { useMenuItems } from "@/context/MenuItemContext";
import MenuItemForm from "./MenuItemForm";
import MenuItemListItem from "./MenuItemListItem";

export default function MenuItemList({ menuItems, onChanged }) {
  const { deleteMenuItem, deleteMenuItemImage } = useMenuItems();
  const [editingItemId, setEditingItemId] = useState(null);

  const handleToggleEdit = useCallback((id) => {
    setEditingItemId((prev) => (prev === id ? null : id));
  }, []);

  const handleDeleteItem = useCallback(async (id) => {
    if (!confirm("Delete this menu item?")) return;
    await deleteMenuItem(id);
    onChanged?.();
  }, [deleteMenuItem, onChanged]);

  const handleDeleteImage = useCallback(async (itemId, imagePath) => {
    await deleteMenuItemImage(itemId, imagePath);
    onChanged?.();
  }, [deleteMenuItemImage, onChanged]);

  const handleEditSuccess = useCallback(() => {
    setEditingItemId(null);
    onChanged?.();
  }, [onChanged]);

  const renderEditForm = useCallback((item) => (
    <MenuItemForm key={item._id} menuItem={item} onSuccess={handleEditSuccess} />
  ), [handleEditSuccess]);

  if (menuItems.length === 0) {
    return <p className="text-gray-400">No menu items yet.</p>;
  }

  return (
    <div className="space-y-3">
      {menuItems.map((item) => (
        <MenuItemListItem
          key={item._id}
          item={item}
          isEditing={editingItemId === item._id}
          onToggleEdit={handleToggleEdit}
          onDelete={handleDeleteItem}
          onDeleteImage={handleDeleteImage}
          renderEditForm={renderEditForm}
        />
      ))}
    </div>
  );
}