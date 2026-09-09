
async function geocodeAddress(address) {
  if (!address || address.trim().length === 0) {
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return null;
    }

    const location = data.results[0].geometry.location; 

    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null;
  }
}

export default geocodeAddress;