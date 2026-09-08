"use client";

import { useState, useEffect, useRef } from "react";
import { useAddresses } from "@/context/AddressContext";

export default function AddressSearchInput({ onSelect }) {
  const { searchAddresses } = useAddresses();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
        
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
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

  function handleSelect(suggestion) {
    setQuery(suggestion.formattedAddress);
    setShowDropdown(false);
    onSelect(suggestion);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder="Search area, street, locality..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        className="w-full border rounded-md px-3 py-2 text-sm"
      />

      {isSearching && (
        <p className="text-xs text-gray-400 mt-1">Searching...</p>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-20 w-full bg-white border rounded-md shadow-lg mt-1 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-b-0"
            >
              {suggestion.formattedAddress}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}