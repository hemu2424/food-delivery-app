"use client";

import { useState } from "react";
import { useAddresses } from "@/context/AddressContext";
import AddressSearchInput from "./AddressSearchInput";
import AddressCard from "./AddressCard";


export default function CheckoutAddressPicker({ onFinalize }) {
  const { addresses, createAddress, reverseGeocode } = useAddresses();

  const [mode, setMode] = useState("choosing"); 
  const [resolvedLocation, setResolvedLocation] = useState(null);
  const [extraDetails, setExtraDetails] = useState("");
  const [saveForLater, setSaveForLater] = useState(false);
  const [saveLabel, setSaveLabel] = useState("home");
  const [saveFlatOrBuilding, setSaveFlatOrBuilding] = useState("");
  const [locateError, setLocateError] = useState("");

  function handleUseCurrentLocation() {
    setMode("current");
    setLocateError("");

    if (!navigator.geolocation) {
      setLocateError("Your browser doesn't support location access.");
      setMode("choosing");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const result = await reverseGeocode(position.coords.latitude, position.coords.longitude);
        if (!result) {
          setLocateError("Could not determine your address. Try searching instead.");
          setMode("choosing");
          return;
        }
        setResolvedLocation(result);
        setMode("details");
      },
      () => {
        setLocateError("Location permission denied. Try searching instead.");
        setMode("choosing");
      },
      { timeout: 10000 }
    );
  }

  function handleSearchSelect(suggestion) {
    setResolvedLocation(suggestion);
    setMode("details");
  }

  function handleSavedSelect(address) {
    const [longitude, latitude] = address.location.coordinates;
    setResolvedLocation({
      formattedAddress: `${address.flatOrBuilding}, ${address.formattedAddress}`,
      latitude,
      longitude,
    });
    
    onFinalize({
      formattedAddress: `${address.flatOrBuilding}, ${address.formattedAddress}`,
      latitude,
      longitude,
    });
  }

  async function handleConfirmDetails() {
    const finalAddress = extraDetails
      ? `${extraDetails}, ${resolvedLocation.formattedAddress}`
      : resolvedLocation.formattedAddress;

    if (saveForLater) {
      try {
        await createAddress({
          label: saveLabel,
          flatOrBuilding: extraDetails || saveFlatOrBuilding || "Not specified",
          locality: resolvedLocation.locality || "",
          city: resolvedLocation.city || "",
          state: resolvedLocation.state || "",
          pincode: resolvedLocation.pincode || "",
          country: resolvedLocation.country || "India",
          formattedAddress: resolvedLocation.formattedAddress,
          latitude: resolvedLocation.latitude,
          longitude: resolvedLocation.longitude,
        });
      } catch (error) {
        console.error("Could not save address for later:", error);
      }
    }

    onFinalize({
      formattedAddress: finalAddress,
      latitude: resolvedLocation.latitude,
      longitude: resolvedLocation.longitude,
    });
  }

  if (mode === "choosing") {
    return (
      <div className="space-y-3">
        <button onClick={handleUseCurrentLocation} className="w-full border rounded-lg p-3 text-left text-sm hover:border-orange-400">
          📍 Use current location
        </button>
        <button onClick={() => setMode("search")} className="w-full border rounded-lg p-3 text-left text-sm hover:border-orange-400">
          🔍 Search for an address
        </button>
        {addresses.length > 0 && (
          <button onClick={() => setMode("saved")} className="w-full border rounded-lg p-3 text-left text-sm hover:border-orange-400">
            🏠 Choose a saved address
          </button>
        )}
        {locateError && <p className="text-sm text-red-600">{locateError}</p>}
      </div>
    );
  }

  if (mode === "current") {
    return <p className="text-sm text-gray-400 text-center py-6">Detecting your location...</p>;
  }

  if (mode === "search") {
    return (
      <div>
        <AddressSearchInput onSelect={handleSearchSelect} />
        <button onClick={() => setMode("choosing")} className="text-xs text-gray-500 hover:underline mt-2">Back</button>
      </div>
    );
  }

  if (mode === "saved") {
    return (
      <div className="space-y-2">
        {addresses.map((address) => (
          <AddressCard key={address._id} address={address} onSelect={handleSavedSelect} selectable />
        ))}
        <button onClick={() => setMode("choosing")} className="text-xs text-gray-500 hover:underline">Back</button>
      </div>
    );
  }

  if (mode === "details" && resolvedLocation) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 border rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Delivering near</p>
          <p className="text-sm">{resolvedLocation.formattedAddress}</p>
          <button onClick={() => setMode("choosing")} className="text-xs text-orange-600 hover:underline mt-1">Change</button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Flat / House / Landmark / Instructions</label>
          <input
            placeholder="e.g. Flat 402, ring bell twice"
            value={extraDetails}
            onChange={(e) => setExtraDetails(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={saveForLater} onChange={(e) => setSaveForLater(e.target.checked)} />
          Save this address for later
        </label>

        {saveForLater && (
          <div>
            <label className="block text-sm font-medium mb-1">Save as</label>
            <div className="flex gap-2">
              {["home", "work", "other"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSaveLabel(option)}
                  className={`flex-1 border rounded-md py-1.5 text-sm capitalize ${
                    saveLabel === option ? "bg-orange-600 text-white border-orange-600" : ""
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleConfirmDetails}
          className="w-full bg-orange-600 text-white py-2 rounded-md text-sm hover:bg-orange-700"
        >
          Confirm Delivery Address
        </button>
      </div>
    );
  }

  return null;
}