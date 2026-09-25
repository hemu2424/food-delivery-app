"use client";

import { useState } from "react";
import { useAddresses } from "@/context/AddressContext";
import AddressSearchInput from "./AddressSearchInput";

export default function AddAddressFlow({ onSuccess, onCancel }) {
  const { reverseGeocode, createAddress } = useAddresses();
  const [step, setStep] = useState("choosing"); 
  const [selectedLocation, setSelectedLocation] = useState(null); 
  const [locateError, setLocateError] = useState("");

  const [formData, setFormData] = useState({ flatOrBuilding: "", label: "home" });
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleUseCurrentLocation() {
    setStep("locating");
    setLocateError("");

    if (!navigator.geolocation) {
      setLocateError("Your browser doesn't support location access.");
      setStep("choosing");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const result = await reverseGeocode(position.coords.latitude, position.coords.longitude);
        if (!result) {
          setLocateError("Could not determine your address. Try searching instead.");
          setStep("choosing");
          return;
        }
        setSelectedLocation(result);
        setStep("details");
      },
      () => {
        setLocateError("Location permission denied. Try searching instead.");
        setStep("choosing");
      },
      { timeout: 10000 }
    );
  }

  function handleSearchSelect(suggestion) {
    setSelectedLocation(suggestion);
    setStep("details");
  }

  async function handleSaveAddress(e) {
    e.preventDefault();
    setSaveError("");
    setIsSaving(true);

    try {
      await createAddress({
        label: formData.label,
        flatOrBuilding: formData.flatOrBuilding,
        locality: selectedLocation.locality,
        city: selectedLocation.city,
        state: selectedLocation.state,
        pincode: selectedLocation.pincode,
        country: selectedLocation.country,
        formattedAddress: selectedLocation.formattedAddress,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
      onSuccess?.();
    } catch (err) {
      setSaveError(err.response?.data?.message || "Could not save address.");
    } finally {
      setIsSaving(false);
    }
  }

  if (step === "choosing") {
    return (
      <div className="space-y-3">
        <button
          onClick={handleUseCurrentLocation}
          className="w-full border rounded-lg p-4 text-left hover:border-orange-400 flex items-center gap-3"
        >
          <span className="text-orange-600">📍</span>
          <span className="text-sm font-medium">Use current location</span>
        </button>

        <div className="border rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Search for area, street, or locality</p>
          <AddressSearchInput onSelect={handleSearchSelect} />
        </div>

        {locateError && <p className="text-sm text-red-600">{locateError}</p>}

        <button onClick={onCancel} className="text-sm text-gray-500 hover:underline">
          Cancel
        </button>
      </div>
    );
  }

  if (step === "locating") {
    return <p className="text-sm text-gray-400 text-center py-8">Detecting your location...</p>;
  }

  if (step === "details" && selectedLocation) {
    return (
      <form onSubmit={handleSaveAddress} className="space-y-4">
        <div className="bg-gray-50 border rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Selected location</p>
          <p className="text-sm">{selectedLocation.formattedAddress}</p>
          <button
            type="button"
            onClick={() => setStep("choosing")}
            className="text-xs text-orange-600 hover:underline mt-1"
          >
            Change
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Flat / House / Building Name</label>
          <input
            required
            placeholder="e.g. Flat 402, B Wing, Sunrise Apartments"
            value={formData.flatOrBuilding}
            onChange={(e) => setFormData({ ...formData, flatOrBuilding: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Save as</label>
          <div className="flex gap-2">
            {["home", "work", "other"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFormData({ ...formData, label: option })}
                className={`flex-1 border rounded-md py-2 text-sm capitalize ${
                  formData.label === option ? "bg-orange-600 text-white border-orange-600" : ""
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-orange-600 text-white py-2 rounded-md text-sm hover:bg-orange-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Address"}
        </button>
      </form>
    );
  }

  return null;
}