"use client";

import { useState, useEffect, useRef } from "react";
import { useAddresses } from "@/context/AddressContext";

export default function AddressSearchInput({ onSelect }) {
  const { searchAddresses, getPlaceDetails } = useAddresses();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]); // now [{ placeId, description }]
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAddresses(query);
      setSuggestions(results);
      setIsSearching(false);
      setShowDropdown(true);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSelect(suggestion) {
    setQuery(suggestion.description);
    setShowDropdown(false);
    setIsLoadingDetails(true);

    const details = await getPlaceDetails(suggestion.placeId);

    setIsLoadingDetails(false);

    if (!details) {
      // Could show an inline error here — keeping it simple for now
      return;
    }

    onSelect(details);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder="Search area, street, locality..."
        value={query}
        onChange={(e) => {
          const nextQuery = e.target.value;
          setQuery(nextQuery);
          if (nextQuery.trim().length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
          }
        }}
        onFocus={() => query.trim().length >= 3 && suggestions.length > 0 && setShowDropdown(true)}
        className="w-full border rounded-md px-3 py-2 text-sm"
      />

      {(isSearching || isLoadingDetails) && (
        <p className="text-xs text-gray-400 mt-1">
          {isLoadingDetails ? "Loading location..." : "Searching..."}
        </p>
      )}

      {query.trim().length >= 3 && showDropdown && suggestions.length > 0 && (
        <div className="absolute z-20 w-full bg-white border rounded-md shadow-lg mt-1 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-b-0"
            >
              {suggestion.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
