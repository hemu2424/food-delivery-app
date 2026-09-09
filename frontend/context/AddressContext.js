"use client";

import { createContext, useContext, useState, useCallback } from "react";
import api from "@/lib/api";

const AddressContext = createContext(null);

export function AddressProvider({ children }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/addresses");
      setAddresses(response.data);
      setError("");
    } catch (err) {
      setError("Could not load your addresses.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function createAddress(addressData) {
    const response = await api.post("/addresses", addressData);
    await fetchAddresses();
    return response.data;
  }

  async function deleteAddress(id) {
    await api.delete(`/addresses/${id}`);
    await fetchAddresses();
  }

  async function setDefaultAddress(id) {
    await api.put(`/addresses/${id}/set-default`);
    await fetchAddresses();
  }


  async function searchAddresses(query) {
    const response = await api.get(`/addresses/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }
  async function reverseGeocode(latitude, longitude) {
  const response = await api.get(`/addresses/reverse-geocode?lat=${latitude}&lng=${longitude}`);
  return response.data;
}
async function updateAddress(id, addressData) {
  const response = await api.put(`/addresses/${id}`, addressData);
  await fetchAddresses();
  return response.data;
}
async function searchAddresses(query) {
  const response = await api.get(`/addresses/search?query=${encodeURIComponent(query)}`);
  return response.data; // now returns [{ placeId, description }], not full details
}

async function getPlaceDetails(placeId) {
  const response = await api.get(`/addresses/place-details?placeId=${placeId}`);
  return response.data; // full { formattedAddress, latitude, longitude, city, ... }
}

  return (
    <AddressContext.Provider
      value={{ addresses, loading, error, fetchAddresses, createAddress, deleteAddress, setDefaultAddress, searchAddresses ,reverseGeocode,updateAddress,getPlaceDetails}}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error("useAddresses must be used inside an AddressProvider");
  }
  return context;
}