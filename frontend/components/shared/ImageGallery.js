"use client";

import Image from "next/image";
import { fileUrl } from "@/lib/fileUrl";

export default function ImageGallery({ images, onDelete }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap mt-3">
      {images.map((imagePath) => (
        <div key={imagePath} className="relative w-20 h-20">
          <Image
            src={imagePath}
            alt="uploaded"
            fill
            sizes="80px"
            className="object-cover rounded-md border"
          />
          <button
            type="button"
            onClick={() => onDelete(imagePath)}
            className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs z-10"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}