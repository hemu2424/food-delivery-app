"use client";

import { useState } from "react";
import { useLocation } from "@/context/LocationContext";
import { useAddresses } from "@/context/AddressContext";
import AddressSearchInput from "./AddressSearchInput";

export default function LocationPrompt() {
  const { status, source, useMyLocation, useSavedAddress, setCoordinatesDirectly, resetLocation, LOCATION_STATUS } = useLocation();
  const { addresses } = useAddresses();
  const [showManualEntry, setShowManualEntry] = useState(false);

  function handleManualSelect(suggestion) {
    setCoordinatesDirectly(suggestion.latitude, suggestion.longitude, "manual");
    setShowManualEntry(false);
  }

  if (showManualEntry) {
    return (
      <div className="surface-card mb-6 p-4 sm:p-5">
        <p className="mb-3 text-sm font-medium text-slate-700">Enter your delivery address</p>
        <AddressSearchInput onSelect={handleManualSelect} />
        <button onClick={() => setShowManualEntry(false)} className="mt-3 text-xs font-medium text-slate-500 transition hover:text-orange-600">
          Back
        </button>
      </div>
    );
  }

  if (status === LOCATION_STATUS.IDLE) {
    return (
      <div className="soft-panel mb-6 p-4 sm:p-5">
        <p className="mb-4 text-center text-sm font-medium text-slate-700">Choose a delivery location</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button onClick={useMyLocation} className="btn-primary text-sm">
            📍 Use My Location
          </button>
          {addresses.length > 0 && (
            <button onClick={useSavedAddress} className="btn-secondary text-sm">
              🏠 Use Saved Address
            </button>
          )}
          <button onClick={() => setShowManualEntry(true)} className="btn-secondary text-sm">
            ✏️ Enter Manually
          </button>
        </div>
      </div>
    );
  }

  if (status === LOCATION_STATUS.LOADING) {
    return <div className="surface-card mb-6 p-4 text-center text-sm text-slate-500">Detecting your location...</div>;
  }

  if (status === LOCATION_STATUS.NEEDS_MANUAL_INPUT) {
    return (
      <div className="soft-panel mb-6 p-4 sm:p-5">
        <p className="mb-3 text-sm font-medium text-slate-700">Could not detect your location. Please enter it below.</p>
        <AddressSearchInput onSelect={handleManualSelect} />
      </div>
    );
  }

  if (status === LOCATION_STATUS.READY) {
    const sourceLabel = source === "browser" ? "your current location" : source === "saved" ? "your saved address" : "your entered address";
    return (
      <div className="surface-card mb-6 flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-slate-600">
          Showing restaurants near <span className="font-semibold text-slate-800">{sourceLabel}</span>
        </span>
        <button onClick={resetLocation} className="text-sm font-medium text-orange-600 transition hover:text-orange-700 hover:underline">
          Change location
        </button>
      </div>
    );
  }

  return null;
}