
async function geocodeAddress(address) {
  if (!address || address.trim().length === 0) {
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
       
        "User-Agent": "FoodExpressApp/1.0 (learning project)",
      },
    });

    if (!response.ok) {
      console.error("Geocoding request failed:", response.status);
      return null;
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      return null; 
    }

    const { lat, lon } = results[0];

    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    };
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null;
  }
}

export default geocodeAddress;