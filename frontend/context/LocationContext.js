"use client";

import { createContext, useContext, useState, useCallback } from "react";
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

  // Uses browser Geolocation directly — called by the "Use My Location" button
  async function useMyLocation() {
    setStatus(LOCATION_STATUS.LOADING);
    const result = await tryBrowserLocation();
    if (result) {
      setCoordinates(result);
      setSource("browser");
      setStatus(LOCATION_STATUS.READY);
    } else {
      setStatus(LOCATION_STATUS.NEEDS_MANUAL_INPUT);
    }
  }
  function setCoordinatesDirectly(latitude, longitude, sourceType) {
  setCoordinates({ latitude, longitude });
  setSource(sourceType);
  setStatus(LOCATION_STATUS.READY);
}

  // Uses the saved DEFAULT address from the Address collection — called by "Use Saved Address" button
  async function useSavedAddress() {
    setStatus(LOCATION_STATUS.LOADING);

    // Make sure we have the freshest address list before checking
    let currentAddresses = addresses;
    if (currentAddresses.length === 0) {
      await fetchAddresses();
    }

    const defaultAddress = currentAddresses.find((a) => a.isDefault) || currentAddresses[0];

    if (!defaultAddress) {
      setStatus(LOCATION_STATUS.NEEDS_MANUAL_INPUT);
      return;
    }

    // The address already HAS coordinates stored — no need to re-geocode at all
    const [longitude, latitude] = defaultAddress.location.coordinates;
    setCoordinates({ latitude, longitude });
    setSource("saved");
    setStatus(LOCATION_STATUS.READY);
  }

  async function setManualLocation(addressText) {
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
  }

  function resetLocation() {
    setCoordinates(null);
    setSource(null);
    setStatus(LOCATION_STATUS.IDLE);
  }

  return (
    <LocationContext.Provider
      value={{ coordinates, status, source, useMyLocation, useSavedAddress, setManualLocation, resetLocation, LOCATION_STATUS ,setCoordinatesDirectly}}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used inside a LocationProvider");
  }
  return context;
}