"use client";

import { createContext, useContext, useCallback, useMemo } from "react";
import api from "@/lib/api";

const MenuItemContext = createContext(null);

export function MenuItemProvider({ children }) {
  const createMenuItem = useCallback(async (formData) => {
    const response = await api.post("/menu", formData);
    return response.data;
  }, []);

  const deleteMenuItem = useCallback(async (id) => {
    await api.delete(`/menu/${id}`);
  }, []);

  const deleteMenuItemImage = useCallback(async (menuItemId, imagePath) => {
    await api.delete(`/menu/${menuItemId}/images`, { data: { imagePath } });
  }, []);

  const updateMenuItem = useCallback(async (id, formData) => {
    const response = await api.put(`/menu/${id}`, formData);
    return response.data;
  }, []);

  const value = useMemo(() => ({
    createMenuItem, deleteMenuItem, deleteMenuItemImage, updateMenuItem
  }), [createMenuItem, deleteMenuItem, deleteMenuItemImage, updateMenuItem]);

  return <MenuItemContext.Provider value={value}>{children}</MenuItemContext.Provider>;
}

export function useMenuItems() {
  const context = useContext(MenuItemContext);
  if (!context) throw new Error("useMenuItems must be used inside a MenuItemProvider");
  return context;
}