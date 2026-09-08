"use client"; // error.js MUST be a client component — Next.js requires this

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
   
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-6 max-w-sm">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset} 
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
        >
          Try again
        </button>
        <a href="/" className="border px-4 py-2 rounded-md hover:bg-gray-50">
          Go home
        </a>
      </div>
    </div>
  );
}