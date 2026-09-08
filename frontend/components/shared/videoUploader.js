"use client";

import { useState } from "react";

export default function VideoUploader({ label = "Video", onChange }) {
  const [preview, setPreview] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];

    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    setPreview({ file, url: URL.createObjectURL(file) });
    onChange(file);
  }

  function removeVideo() {
    setPreview(null);
    onChange(null);
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-600">{label}</label>

      <label htmlFor="video-upload" className="group cursor-pointer block w-full border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-orange-300 transition">
        <div className="flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-gray-400 group-hover:text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
            <rect x="3" y="6" width="12" height="12" rx="2" ry="2" strokeWidth="1.5" />
          </svg>
          <div className="text-sm text-gray-500">Click to upload a promo video</div>
        </div>
        <input id="video-upload" type="file" accept="video/*" onChange={handleFileChange} className="sr-only" />
      </label>

      {preview && (
        <div className="mt-3 rounded-md overflow-hidden bg-gray-50">
          <video src={preview.url} controls className="w-full max-h-44 object-cover" />
          <div className="p-2 flex justify-end">
            <button
              type="button"
              onClick={removeVideo}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}