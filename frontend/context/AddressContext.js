"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const AddressContext = createContext(null);

export function AddressProvider({ children }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get("/addresses");
      setAddresses(response.data);
      setError("");
    } catch (err) {
      if (err.response?.status !== 401) setError("Could not load your addresses.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createAddress = useCallback(async (addressData) => {
    const response = await api.post("/addresses", addressData);
    await fetchAddresses();
    return response.data;
  }, [fetchAddresses]);

  const deleteAddress = useCallback(async (id) => {
    await api.delete(`/addresses/${id}`);
    await fetchAddresses();
  }, [fetchAddresses]);

  const setDefaultAddress = useCallback(async (id) => {
    await api.put(`/addresses/${id}/set-default`);
    await fetchAddresses();
  }, [fetchAddresses]);

  const searchAddresses = useCallback(async (query) => {
    const response = await api.get(`/addresses/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }, []);

  const reverseGeocode = useCallback(async (latitude, longitude) => {
    const response = await api.get(`/addresses/reverse-geocode?lat=${latitude}&lng=${longitude}`);
    return response.data;
  }, []);

  const updateAddress = useCallback(async (id, addressData) => {
    const response = await api.put(`/addresses/${id}`, addressData);
    await fetchAddresses();
    return response.data;
  }, [fetchAddresses]);

  const getPlaceDetails = useCallback(async (placeId) => {
    const response = await api.get(`/addresses/place-details?placeId=${placeId}`);
    return response.data;
  }, []);

  const value = useMemo(() => ({
    addresses, loading, error, fetchAddresses, createAddress, deleteAddress,
    setDefaultAddress, searchAddresses, reverseGeocode, updateAddress, getPlaceDetails
  }), [
    addresses, loading, error, fetchAddresses, createAddress, deleteAddress,
    setDefaultAddress, searchAddresses, reverseGeocode, updateAddress, getPlaceDetails
  ]);

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useAddresses() {
  const context = useContext(AddressContext);
  if (!context) throw new Error("useAddresses must be used inside an AddressProvider");
  return context;
}