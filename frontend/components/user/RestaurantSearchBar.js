"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRestaurants } from "@/context/RestaurantContext";


export default function RestaurantSearchBar({ onSearchChange }) {
  const { fetchRestaurants, cuisines, fetchCuisines } = useRestaurants();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") || "");

  useEffect(() => {
    fetchCuisines();
  }, [fetchCuisines]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (cuisine) params.set("cuisine", cuisine);

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });

      onSearchChange({ search, cuisine }); 
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search, cuisine, pathname, router, onSearchChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        type="text"
        placeholder="Search restaurants..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-200"
      />
      <select
        value={cuisine}
        onChange={(e) => setCuisine(e.target.value)}
        className="sm:w-48 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-200 bg-white"
      >
        <option value="">All cuisines</option>
        {cuisines.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}