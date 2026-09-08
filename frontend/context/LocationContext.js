"use client";

import { createContext, useContext, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const LocationContext = createContext(null);

const LOCATION_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  READY: "ready",                 
  DENIED: "denied",              
  NEEDS_MANUAL_INPUT: "needs_manual_input",
  ERROR: "error",
};

export function LocationProvider({ children }) {
  const { user } = useAuth();
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
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          resolve(null); 
        },
        { timeout: 10000 } 
      );
    });
  }, []);

  const trySavedAddress = useCallback(async () => {
    if (!user?.address) return null;

    try {
      const response = await api.get(`/restaurants/geocode?address=${encodeURIComponent(user.address)}`);
      return response.data; 
    } catch (error) {
      return null;
    }
  }, [user]);

 
  const detectLocation = useCallback(async () => {
    setStatus(LOCATION_STATUS.LOADING);

    const browserResult = await tryBrowserLocation();
    if (browserResult) {
      setCoordinates(browserResult);
      setSource("browser");
      setStatus(LOCATION_STATUS.READY);
      return;
    }

    const savedResult = await trySavedAddress();
    if (savedResult) {
      setCoordinates(savedResult);
      setSource("saved");
      setStatus(LOCATION_STATUS.READY);
      return;
    }

    setStatus(LOCATION_STATUS.NEEDS_MANUAL_INPUT);
  }, [tryBrowserLocation, trySavedAddress]);

 
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
      value={{ coordinates, status, source, detectLocation, setManualLocation, resetLocation, LOCATION_STATUS }}
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