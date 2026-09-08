"use client";

import Link from "next/link";
import Image from "next/image";


export default function RestaurantCard({ restaurant }) {
  const thumbnail = restaurant.images?.[0];

  return (
    <Link href={`/user/restaurant/${restaurant._id}`} className="block bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative w-full h-40 bg-gray-100">
        {thumbnail ? (
          <Image src={thumbnail} alt={restaurant.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No image</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{restaurant.name}</h3>
          {restaurant.distanceKm !== undefined && (
            <span className="text-xs text-gray-400 whitespace-nowrap">{restaurant.distanceKm} km</span>
          )}
        </div>
        <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
      </div>
    </Link>
  );
}