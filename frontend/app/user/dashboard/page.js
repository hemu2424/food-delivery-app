"use client";

import { useEffect, useState, Suspense } from "react";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLocation } from "@/context/LocationContext";
import RestaurantCard from "@/components/user/RestaurantCard";
import RestaurantCardSkeleton from "@/components/shared/RestaurantCardSkeleton";
import LocationPrompt from "@/components/user/LocationPrompt";
import { useAddresses } from "@/context/AddressContext";

function DashboardContent() {
  const { fetchAddresses } = useAddresses();
  const { coordinates, status, LOCATION_STATUS } = useLocation();
  const [formData, setFormData] = useState({ deliveryRadiusKm: "" });

  function handleTextChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const shouldFetch = status === LOCATION_STATUS.READY && coordinates;
  const radiusQuery = formData.deliveryRadiusKm ? `&radius=${formData.deliveryRadiusKm}` : "";

  const { data, error, isLoading } = useSWR(
    shouldFetch ? `/restaurants/nearby?lat=${coordinates.latitude}&lng=${coordinates.longitude}${radiusQuery}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  const nearbyRestaurants = data?.restaurants ?? [];
  const nearbySearchRadiusKm = data?.searchRadiusKm ?? null;
  const nearbyError = error ? "Could not load nearby restaurants." : "";

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return (
    <div className="app-shell">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Discover</span>
          <h1 className="mt-4 section-title">Restaurants near you</h1>
        </div>
      </div>

      <LocationPrompt />

      {status === LOCATION_STATUS.READY && (
        <>
          <div className="surface-card mb-6 max-w-md p-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Delivery Radius (km)</label>
                <input
                  name="deliveryRadiusKm"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 5, 10, 20"
                  value={formData.deliveryRadiusKm}
                  onChange={handleTextChange}
                  className="input-shell"
                />
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <RestaurantCardSkeleton key={i} />
              ))}
            </div>
          )}

          {nearbyError && <p className="text-sm font-medium text-red-600">{nearbyError}</p>}

          {!isLoading && nearbyRestaurants.length === 0 && !nearbyError && (
            <div className="surface-card p-5 text-sm text-slate-600">
              No restaurants deliver to your location right now, even within 15km. Try a different address.
            </div>
          )}

          {!isLoading && nearbyRestaurants.length > 0 && (
            <>
              <p className="mb-4 text-sm font-medium text-slate-500">
                Showing restaurants within {nearbySearchRadiusKm} km
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {nearbyRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <Suspense fallback={<div className="app-shell h-10" />}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}