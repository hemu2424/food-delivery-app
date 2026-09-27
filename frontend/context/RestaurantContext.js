"use client"

import api from "@/lib/api";
import { mutate } from "swr";
import { useContext, useState, createContext, useCallback, useMemo } from "react";
const RestaurantsContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [cuisines, setCuisines] = useState([]);

  const fetchCuisines = useCallback(async () => {
    try {
      const response = await api.get("/restaurants/cuisines");
      const data = response.data;
      setCuisines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchRestaurantById = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/restaurants/${id}`);
      setCurrentRestaurant(response.data.restaurant);
      setMenuItems(Array.isArray(response.data.menuItems) ? response.data.menuItems : []);
      setDetailError("");
    } catch (err) {
      console.log(err);
      setDetailError("Could not load this restaurant.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const updateRestaurant = useCallback(async (id, formData) => {
    await api.put(`/restaurants/${id}`, formData);
    await mutate("/restaurants");
  }, []);

  const createRestaurant = useCallback(async (formData) => {
    await api.post("/restaurants", formData);
    await mutate("/restaurants");
  }, []);

  const deleteRestaurant = useCallback(async (id) => {
    await api.delete(`/restaurants/${id}`);
    await mutate("/restaurants");
  }, []);

  const deleteRestaurantImage = useCallback(async (restaurantId, imagePath) => {
    await api.delete(`/restaurants/${restaurantId}/images`, { data: { imagePath } });
    await mutate("/restaurants");
  }, []);

  const value = useMemo(() => ({
    createRestaurant, deleteRestaurant, deleteRestaurantImage,
    currentRestaurant, menuItems, detailLoading, detailError, fetchRestaurantById,
    cuisines, fetchCuisines, updateRestaurant,
  }), [
    createRestaurant, deleteRestaurant, deleteRestaurantImage,
    currentRestaurant, menuItems, detailLoading, detailError, fetchRestaurantById,
    cuisines, fetchCuisines, updateRestaurant,
  ]);

  return <RestaurantsContext.Provider value={value}>{children}</RestaurantsContext.Provider>;
}

export function useRestaurants() {
  const context = useContext(RestaurantsContext);
  if (!context) throw new Error("useRestaurants must be used inside a RestaurantProvider");
  return context;
}