"use client";

import { useEffect, Suspense } from "react";
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

  const shouldFetch = status === LOCATION_STATUS.READY && coordinates;
  const { data, error, isLoading } = useSWR(
    shouldFetch ? `/restaurants/nearby?lat=${coordinates.latitude}&lng=${coordinates.longitude}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const nearbyRestaurants = data?.restaurants ?? [];
  const nearbySearchRadiusKm = data?.searchRadiusKm ?? null;
  const nearbyLoading = isLoading;
  const nearbyError = error ? "Could not load nearby restaurants." : "";

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Restaurants near you</h1>

      <LocationPrompt />

      {status === LOCATION_STATUS.READY && (
        <>
          {nearbyLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
            </div>
          )}

          {nearbyError && <p className="text-red-600">{nearbyError}</p>}

          {!nearbyLoading && nearbyRestaurants.length === 0 && !nearbyError && (
            <p className="text-gray-400">
              No restaurants deliver to your location right now, even within 15km. Try a different address.
            </p>
          )}

          {!nearbyLoading && nearbyRestaurants.length > 0 && (
            <>
              <p className="text-xs text-gray-400 mb-3">
                Showing restaurants within {nearbySearchRadiusKm} km
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default function UserDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <Suspense fallback={<div className="h-10 mb-6" />}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}