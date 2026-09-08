"use client";

import { useState } from "react";
import { useLocation } from "@/context/LocationContext";

export default function LocationPrompt() {
  const { status, source, coordinates, detectLocation, setManualLocation, resetLocation, LOCATION_STATUS } =
    useLocation();
  const [manualAddress, setManualAddress] = useState("");
  const [manualError, setManualError] = useState("");

  async function handleManualSubmit(e) {
    e.preventDefault();
    setManualError("");
    const success = await setManualLocation(manualAddress);
    if (!success) {
      setManualError("Could not find that location. Try being more specific.");
    }
  }


  if (status === LOCATION_STATUS.IDLE) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-center">
        <p className="text-sm text-gray-700 mb-3">
          Find restaurants near you by sharing your location.
        </p>
        <button
          onClick={detectLocation}
          className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700"
        >
          Use My Location
        </button>
      </div>
    );
  }

  if (status === LOCATION_STATUS.LOADING) {
    return (
      <div className="bg-gray-50 border rounded-lg p-4 mb-6 text-center text-sm text-gray-500">
        Detecting your location...
      </div>
    );
  }

  if (status === LOCATION_STATUS.NEEDS_MANUAL_INPUT) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700 mb-3">
          We couldn't detect your location automatically. Please enter your delivery address.
        </p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Enter your address"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="flex-1 border rounded-md px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700">
            Find Restaurants
          </button>
        </form>
        {manualError && <p className="text-sm text-red-600 mt-2">{manualError}</p>}
      </div>
    );
  }

  if (status === LOCATION_STATUS.ERROR) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
        <p className="text-sm text-red-700 mb-3">Something went wrong finding that location.</p>
        <button onClick={resetLocation} className="text-sm text-orange-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  if (status === LOCATION_STATUS.READY) {
    const sourceLabel =
      source === "browser" ? "your current location" : source === "saved" ? "your saved address" : "your entered address";

    return (
      <div className="flex items-center justify-between bg-white border rounded-lg px-4 py-2 mb-6 text-sm">
        <span className="text-gray-600">
          Showing restaurants near <span className="font-medium">{sourceLabel}</span>
        </span>
        <button onClick={resetLocation} className="text-orange-600 hover:underline">
          Change location
        </button>
      </div>
    );
  }

  return null;
}