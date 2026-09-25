"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { useAddresses } from "@/context/AddressContext";

const LocationContext = createContext(null);

const LOCATION_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  READY: "ready",
  NEEDS_MANUAL_INPUT: "needs_manual_input",
  ERROR: "error",
};

export function LocationProvider({ children }) {
  const { addresses, fetchAddresses } = useAddresses();
  const [coordinates, setCoordinates] = useState(null);
  const [status, setStatus] = useState(LOCATION_STATUS.IDLE);
  const [source, setSource] = useState(null);

  const tryBrowserLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => resolve(null),
        { timeout: 10000 }
      );
    });
  }, []);

  const useMyLocation = useCallback(async () => {
    setStatus(LOCATION_STATUS.LOADING);
    const result = await tryBrowserLocation();
    if (result) {
      setCoordinates(result);
      setSource("browser");
      setStatus(LOCATION_STATUS.READY);
    } else {
      setStatus(LOCATION_STATUS.NEEDS_MANUAL_INPUT);
    }
  }, [tryBrowserLocation]);

  const setCoordinatesDirectly = useCallback((latitude, longitude, sourceType) => {
    setCoordinates({ latitude, longitude });
    setSource(sourceType);
    setStatus(LOCATION_STATUS.READY);
  }, []);

  const useSavedAddress = useCallback(async () => {
    setStatus(LOCATION_STATUS.LOADING);
    let currentAddresses = addresses;
    if (currentAddresses.length === 0) {
      await fetchAddresses();
    }
    const defaultAddress = currentAddresses.find((a) => a.isDefault) || currentAddresses[0];
    if (!defaultAddress) {
      setStatus(LOCATION_STATUS.NEEDS_MANUAL_INPUT);
      return;
    }
    const [longitude, latitude] = defaultAddress.location.coordinates;
    setCoordinates({ latitude, longitude });
    setSource("saved");
    setStatus(LOCATION_STATUS.READY);
  }, [addresses, fetchAddresses]);

  const setManualLocation = useCallback(async (addressText) => {
    setStatus(LOCATION_STATUS.LOADING);
    try {
      const response = await api.get(`/restaurants/geocode?address=${encodeURIComponent(addressText)}`);
      setCoordinates(response.data);
      setSource("manual");
      setStatus(LOCATION_STATUS.READY);
      return true;
    } catch (error) {
      setStatus(LOCATION_STATUS.NEEDS_MANUAL_INPUT);
      return false;
    }
  }, []);

  const resetLocation = useCallback(() => {
    setCoordinates(null);
    setSource(null);
    setStatus(LOCATION_STATUS.IDLE);
  }, []);

  const value = useMemo(() => ({
    coordinates, status, source, useMyLocation, useSavedAddress,
    setManualLocation, resetLocation, LOCATION_STATUS, setCoordinatesDirectly
  }), [
    coordinates, status, source, useMyLocation, useSavedAddress,
    setManualLocation, resetLocation, setCoordinatesDirectly
  ]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used inside a LocationProvider");
  return context;
}