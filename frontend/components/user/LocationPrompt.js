"use client";

import { useState } from "react";
import { useLocation } from "@/context/LocationContext";
import { useAddresses } from "@/context/AddressContext";
import AddressSearchInput from "./AddressSearchInput";

export default function LocationPrompt() {
  const { status, source, coordinates, useMyLocation, useSavedAddress, setCoordinatesDirectly, resetLocation, LOCATION_STATUS } =
    useLocation();
  const { addresses } = useAddresses();
  const [showManualEntry, setShowManualEntry] = useState(false);

  function handleManualSelect(suggestion) {
    setCoordinatesDirectly(suggestion.latitude, suggestion.longitude, "manual");
    setShowManualEntry(false);
  }
  

  // IMPORTANT: this check comes FIRST, before the IDLE check below —
  // otherwise the IDLE block would always win and this would never render.
  if (showManualEntry) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700 mb-3">Enter your delivery address</p>
        <AddressSearchInput onSelect={handleManualSelect} />
        <button
          onClick={() => setShowManualEntry(false)}
          className="text-xs text-gray-500 hover:underline mt-2"
        >
          Back
        </button>
      </div>
    );
  }

  if (status === LOCATION_STATUS.IDLE) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700 mb-3 text-center">Choose a delivery location</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button onClick={useMyLocation} className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700">
            📍 Use My Location
          </button>
          {addresses.length > 0 && (
            <button onClick={useSavedAddress} className="border border-orange-600 text-orange-600 px-4 py-2 rounded-md text-sm hover:bg-orange-50">
              🏠 Use Saved Address
            </button>
          )}
          <button onClick={() => setShowManualEntry(true)} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
            ✏️ Enter Manually
          </button>
        </div>
      </div>
    );
  }

  if (status === LOCATION_STATUS.LOADING) {
    return <div className="bg-gray-50 border rounded-lg p-4 mb-6 text-center text-sm text-gray-500">Detecting your location...</div>;
  }

  if (status === LOCATION_STATUS.NEEDS_MANUAL_INPUT) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700 mb-3">Could not detect your location. Please enter it below.</p>
        <AddressSearchInput onSelect={handleManualSelect} />
      </div>
    );
  }

  if (status === LOCATION_STATUS.READY) {
    const sourceLabel = source === "browser" ? "your current location" : source === "saved" ? "your saved address" : "your entered address";
    return (
      <div className="flex items-center justify-between bg-white border rounded-lg px-4 py-2 mb-6 text-sm">
        <span className="text-gray-600">Showing restaurants near <span className="font-medium">{sourceLabel}</span></span>
        <button onClick={resetLocation} className="text-orange-600 hover:underline">Change location</button>
      </div>
    );
  }

  return null;
}