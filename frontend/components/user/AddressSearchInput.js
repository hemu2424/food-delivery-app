"use client";

import { useState, useEffect, useRef } from "react";
import { useAddresses } from "@/context/AddressContext";

export default function AddressSearchInput({
  value,
  initialValue = "",
  onChange,
  onSelect,
  placeholder = "Search area, street, locality...",
  className = "w-full border rounded-md px-3 py-2 text-sm",
  name = "address",
  required = false,
  showLocateButton = false,
}) {
  const { searchAddresses, getPlaceDetails, reverseGeocode } = useAddresses();
  const [query, setQuery] = useState(value !== undefined ? value : initialValue);
  const [suggestions, setSuggestions] = useState([]); // [{ placeId, description }]
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value || "");
    }
  }, [value]);

  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAddresses(query);
      setSuggestions(results || []);
      setIsSearching(false);
      setShowDropdown(true);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query, searchAddresses]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(e) {
    const nextVal = e.target.value;
    setQuery(nextVal);
    if (onChange) {
      onChange(e);
    }
    if (nextVal.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }

  async function handleSelect(suggestion) {
    setShowDropdown(false);
    setIsLoadingDetails(true);

    const details = await getPlaceDetails(suggestion.placeId);
    setIsLoadingDetails(false);

    const addressText = details?.formattedAddress || suggestion.description;
    setQuery(addressText);

    if (onChange) {
      onChange({ target: { name, value: addressText } });
    }

    if (onSelect) {
      onSelect(details || { formattedAddress: suggestion.description, description: suggestion.description });
    }
  }

  function handleLocateMe() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (result?.formattedAddress) {
            setQuery(result.formattedAddress);
            if (onChange) {
              onChange({ target: { name, value: result.formattedAddress } });
            }
            if (onSelect) {
              onSelect(result);
            }
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error("Location error:", err);
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <input
          type="text"
          name={name}
          required={required}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && query.trim().length >= 3 && suggestions.length > 0 && setShowDropdown(true)}
          className={`${className} ${showLocateButton ? "pr-10" : ""}`}
        />
        {showLocateButton && (
          <button
            type="button"
            title="Use current location"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="absolute right-2 text-gray-400 hover:text-orange-600 p-1.5 transition disabled:opacity-50 text-sm"
          >
            {isLocating ? "⏳" : "📍"}
          </button>
        )}
      </div>

      {(isSearching || isLoadingDetails || isLocating) && (
        <p className="text-xs text-gray-400 mt-1">
          {isLocating
            ? "Detecting location..."
            : isLoadingDetails
            ? "Loading location details..."
            : "Searching..."}
        </p>
      )}

      {query && query.trim().length >= 3 && showDropdown && suggestions.length > 0 && (
        <div className="absolute z-30 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-orange-50 border-b border-gray-100 last:border-b-0 text-gray-700 transition"
            >
              <div className="flex items-start gap-2">
                <span className="text-orange-500 text-xs mt-0.5">📍</span>
                <span className="line-clamp-2">{suggestion.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
