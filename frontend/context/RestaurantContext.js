"use client";

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

  const revalidateRestaurants = useCallback(async () => {
    await mutate(
      (key) => typeof key === "string" && key.startsWith("/restaurants"),
      undefined,
      { revalidate: true }
    );
  }, []);

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
    if (!id) return;
    setDetailLoading(true);
    try {
      const response = await api.get(`/restaurants/${id}`);
      setCurrentRestaurant(response.data.restaurant);
      setMenuItems(Array.isArray(response.data.menuItems) ? response.data.menuItems : []);
      setDetailError("");
    } catch (err) {
      console.error(err);
      setDetailError("Could not load this restaurant.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const updateRestaurant = useCallback(async (id, formData) => {
    const response = await api.put(`/restaurants/${id}`, formData);
    await revalidateRestaurants();
    return response.data;
  }, [revalidateRestaurants]);

  const createRestaurant = useCallback(async (formData) => {
    const response = await api.post("/restaurants", formData);
    await revalidateRestaurants();
    return response.data;
  }, [revalidateRestaurants]);

  const deleteRestaurant = useCallback(async (id) => {
    const response = await api.delete(`/restaurants/${id}`);
    await revalidateRestaurants();
    return response.data;
  }, [revalidateRestaurants]);

  const deleteRestaurantImage = useCallback(async (restaurantId, imagePath) => {
    const response = await api.delete(`/restaurants/${restaurantId}/images`, {
      data: { imagePath },
    });
    await revalidateRestaurants();
    return response.data;
  }, [revalidateRestaurants]);

  const value = useMemo(
    () => ({
      createRestaurant,
      deleteRestaurant,
      deleteRestaurantImage,
      currentRestaurant,
      menuItems,
      detailLoading,
      detailError,
      fetchRestaurantById,
      cuisines,
      fetchCuisines,
      updateRestaurant,
    }),
    [
      createRestaurant,
      deleteRestaurant,
      deleteRestaurantImage,
      currentRestaurant,
      menuItems,
      detailLoading,
      detailError,
      fetchRestaurantById,
      cuisines,
      fetchCuisines,
      updateRestaurant,
    ]
  );

  return (
    <RestaurantsContext.Provider value={value}>
      {children}
    </RestaurantsContext.Provider>
  );
}

export function useRestaurants() {
  const context = useContext(RestaurantsContext);
  if (!context)
    throw new Error("useRestaurants must be used inside a RestaurantProvider");
  return context;
}