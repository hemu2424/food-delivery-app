"use client";

import { createContext, useContext } from "react";
import api from "@/lib/api";

const MenuItemContext = createContext(null);

export function MenuItemProvider({ children }) {
  async function createMenuItem(formData) {
    const response = await api.post("/menu", formData);
    return response.data;
  }

  async function deleteMenuItem(id) {
    await api.delete(`/menu/${id}`);
  }

  async function deleteMenuItemImage(menuItemId, imagePath) {
    await api.delete(`/menu/${menuItemId}/images`, { data: { imagePath } });
  }
  async function updateMenuItem(id, formData) {
  const response = await api.put(`/menu/${id}`, formData);
  return response.data;
}

  return (
    <MenuItemContext.Provider value={{ createMenuItem, deleteMenuItem, deleteMenuItemImage, updateMenuItem }}>
      {children}
    </MenuItemContext.Provider>
  );
}

export function useMenuItems() {
  const context = useContext(MenuItemContext);
  if (!context) {
    throw new Error("useMenuItems must be used inside a MenuItemProvider");
  }
  return context;
}