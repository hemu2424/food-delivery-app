"use client";

import Image from "next/image";
import { fileUrl } from "@/lib/fileUrl";

export default function MenuItemCard({ item, onAdd }) {
  const thumbnail = item.images?.[0];

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={item.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No image
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-sm font-semibold text-orange-600 mt-1">₹{item.price}</p>
        </div>
      </div>
      <button onClick={() => onAdd(item)} className="bg-orange-600 text-white text-sm px-3 py-2 rounded-md hover:bg-orange-700">
        Add
      </button>
    </div>
  );
}