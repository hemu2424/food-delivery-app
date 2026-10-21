// components/user/RestaurantCard.js
"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";

function RestaurantCard({ restaurant }) {
  const thumbnail = restaurant.images?.[0];

  return (
    <Link href={`/user/restaurant/${restaurant._id}`} className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      <div className="relative h-44 w-full bg-slate-100">
        {thumbnail ? (
          <Image src={thumbnail} alt={restaurant.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No image</div>
        )}
        {restaurant.distanceKm !== undefined && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-sm">
            {restaurant.distanceKm} km
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{restaurant.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{restaurant.cuisine}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 font-medium text-orange-700">Popular</span>
          <span>Open now</span>
        </div>
      </div>
    </Link>
  );
}

export default memo(RestaurantCard);