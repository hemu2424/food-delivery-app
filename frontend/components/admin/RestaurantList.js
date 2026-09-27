"use client";

import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import RestaurantListItem from "./RestaurantListItem";

export default function RestaurantList() {
  const { data, error: swrError, isLoading } = useSWR("/restaurants", fetcher);

  const restaurants = Array.isArray(data) ? data : data?.restaurants ?? [];
  const loading = isLoading;
  const error = swrError ? "Could not fetch restaurants" : "";

  if (loading) return <p className="text-gray-400">Loading restaurants...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (restaurants.length === 0) {
    return <p className="text-gray-400">No restaurants yet. Create your first one above.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {restaurants.map((restaurant) => (
        <RestaurantListItem key={restaurant._id} restaurant={restaurant} />
      ))}
    </div>
  );
}