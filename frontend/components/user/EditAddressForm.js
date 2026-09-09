"use client";

import { useState } from "react";
import { useAddresses } from "@/context/AddressContext";
import AddressSearchInput from "./AddressSearchInput";

export default function EditAddressForm({ address, onSuccess, onCancel }) {
  const { updateAddress } = useAddresses();

  const [flatOrBuilding, setFlatOrBuilding] = useState(address.flatOrBuilding);
  const [label, setLabel] = useState(address.label);
  const [changingLocation, setChangingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState(null); // only set if user picks a NEW location
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleLocationSelect(suggestion) {
    setNewLocation(suggestion);
    setChangingLocation(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const payload = { flatOrBuilding, label };

      // Only include location fields if the user actually picked a new one —
      // otherwise the existing location stays untouched (updateAddressSchema is .partial(), so this is fine)
      if (newLocation) {
        payload.formattedAddress = newLocation.formattedAddress;
        payload.city = newLocation.city;
        payload.state = newLocation.state;
        payload.pincode = newLocation.pincode;
        payload.country = newLocation.country;
        payload.locality = newLocation.locality;
        payload.latitude = newLocation.latitude;
        payload.longitude = newLocation.longitude;
      }

      await updateAddress(address._id, payload);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update address.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-lg p-4">
      <div className="bg-gray-50 border rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1">Location</p>
        <p className="text-sm">{newLocation ? newLocation.formattedAddress : address.formattedAddress}</p>

        {!changingLocation && (
          <button
            type="button"
            onClick={() => setChangingLocation(true)}
            className="text-xs text-orange-600 hover:underline mt-1"
          >
            Change location
          </button>
        )}

        {changingLocation && (
          <div className="mt-2">
            <AddressSearchInput onSelect={handleLocationSelect} />
            <button
              type="button"
              onClick={() => setChangingLocation(false)}
              className="text-xs text-gray-500 hover:underline mt-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Flat / House / Building Name</label>
        <input
          required
          value={flatOrBuilding}
          onChange={(e) => setFlatOrBuilding(e.target.value)}
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
              onClick={() => setLabel(option)}
              className={`flex-1 border rounded-md py-2 text-sm capitalize ${
                label === option ? "bg-orange-600 text-white border-orange-600" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 bg-orange-600 text-white py-2 rounded-md text-sm hover:bg-orange-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 border py-2 rounded-md text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}