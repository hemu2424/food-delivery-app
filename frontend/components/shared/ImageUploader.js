"use client";

import { useToast } from "@/context/ToastContext";
import { useState } from "react";


export default function ImageUploader({ label = "Images", maxCount = 5, onChange }) {
  const [previews, setPreviews] = useState([]);
  const { showToast } = useToast();


  function handleFileChange(e) {
    const files = Array.from(e.target.files);

    if (files.length > maxCount) {
      showToast(`You can only select up to ${maxCount} images.`);
      return;
    }

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);
    onChange(files); 
  }

  function removeImage(indexToRemove) {
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);
    setPreviews(updatedPreviews);
    onChange(updatedPreviews.map((p) => p.file)); 
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-600">{label}</label>

      <label htmlFor="image-upload" className="group cursor-pointer block w-full border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-orange-300 transition">
        <div className="flex flex-col items-center justify-center gap-2">
          <svg className="w-8 h-8 text-gray-400 group-hover:text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4v8z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 11l3 3 7-7" />
          </svg>
          <div className="text-sm text-gray-500">Drag & drop images here, or click to browse</div>
          <div className="text-xs text-gray-400">Max {maxCount} images</div>
        </div>
        <input id="image-upload" type="file" accept="image/*" multiple onChange={handleFileChange} className="sr-only" />
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative overflow-hidden rounded-md bg-gray-50">
              <img
                src={preview.url}
                alt="preview"
                className="w-full h-24 object-cover transition-transform transform hover:scale-105"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full text-xs opacity-0 hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}