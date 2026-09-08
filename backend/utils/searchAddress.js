
async function searchAddress(query, limit = 5) {
  if (!query || query.trim().length < 3) {
    return []; 
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=${limit}&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "FoodExpressApp/1.0 (learning project)",
      },
    });

    if (!response.ok) {
      console.error("Address search failed:", response.status);
      return [];
    }

    const results = await response.json();

   
    return results.map((result) => ({
      formattedAddress: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    
      city:
        result.address?.city ||
        result.address?.town ||
        result.address?.village ||
        "",
      state: result.address?.state || "",
      pincode: result.address?.postcode || "",
      country: result.address?.country || "",
      locality:
        result.address?.suburb ||
        result.address?.neighbourhood ||
        result.address?.road ||
        "",
    }));
  } catch (error) {
    console.error("Address search error:", error.message);
    return [];
  }
}

export default searchAddress;