"use client";

import Image from "next/image";
import { useToast } from "@/context/ToastContext";
import { useState, useId, useEffect } from "react";

export default function ImageUploader({ label = "Images", maxCount = 5, onChange }) {
  const [previews, setPreviews] = useState([]);
  const { showToast } = useToast();
  const rawId = useId();
  const inputId = `image-upload-${rawId.replace(/:/g, "")}`;

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url && p.url.startsWith("blob:")) {
          URL.revokeObjectURL(p.url);
        }
      });
    };
  }, [previews]);

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > maxCount) {
      showToast(`You can only select up to ${maxCount} images.`, "error");
      return;
    }

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);
    onChange?.(files);
  }

  function removeImage(indexToRemove) {
    const removed = previews[indexToRemove];
    if (removed?.url && removed.url.startsWith("blob:")) {
      URL.revokeObjectURL(removed.url);
    }
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);
    setPreviews(updatedPreviews);
    onChange?.(updatedPreviews.map((p) => p.file));
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-600">{label}</label>

      <label
        htmlFor={inputId}
        className="group cursor-pointer block w-full border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-orange-300 transition bg-white"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <svg
            className="w-8 h-8 text-gray-400 group-hover:text-orange-400 transition-colors"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M3 15a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4v8z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M7 11l3 3 7-7"
            />
          </svg>
          <div className="text-sm text-gray-500 font-medium">Click to browse or drag images here</div>
          <div className="text-xs text-gray-400">Max {maxCount} images (JPG, PNG, WebP, GIF, AVIF)</div>
        </div>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group overflow-hidden rounded-md bg-gray-50 border border-gray-200">
              <Image
                src={preview.url}
                alt="preview"
                width={96}
                height={96}
                unoptimized
                className="w-full h-24 object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}