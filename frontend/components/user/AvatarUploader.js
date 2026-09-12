"use client";

import Image from "next/image";
import { useState } from "react";

export default function AvatarUploader({ currentAvatar, onChange }) {
  const [preview, setPreview] = useState(currentAvatar || null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    onChange(file);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center relative">
        {preview ? (
          <Image src={preview} alt="Avatar preview" fill unoptimized className="object-cover" />
        ) : (
          <span className="text-gray-400 text-xs">No photo</span>
        )}
      </div>
      <label className="text-sm text-orange-600 hover:underline cursor-pointer">
        Change photo
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>
    </div>
  );
}