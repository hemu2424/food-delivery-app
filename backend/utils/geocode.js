
// async function geocodeAddress(address) {
//   if (!address || address.trim().length === 0) {
//     return null;
//   }

//   try {
//     const encodedAddress = encodeURIComponent(address);
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

//     const response = await fetch(url);
//     const data = await response.json();

//     if (data.status !== "OK" || !data.results || data.results.length === 0) {
//       return null;
//     }

//     const location = data.results[0].geometry.location; 

//     return {
//       latitude: location.lat,
//       longitude: location.lng,
//     };
//   } catch (error) {
//     console.error("Geocoding error:", error.message);
//     return null;
//   }
// }

// export default geocodeAddress;

// ---------------------------------------------------------------above for google map api-----------------------------
async function geocodeAddress(address) {
  if (!address || address.trim().length === 0) {
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());

    const url = `https://api.maptiler.com/geocoding/${encodedAddress}.json?key=${process.env.MAPTILER_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        "MapTiler API error:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();

    console.log("MapTiler geocoding response:", data);

    // MapTiler returns results inside "features"
    if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
      return null;
    }

    // Get coordinates from the first result
    const coordinates = data.features[0].geometry?.coordinates;

    if (!coordinates || coordinates.length < 2) {
      return null;
    }

    // GeoJSON coordinates format:
    // [longitude, latitude]
    const longitude = coordinates[0];
    const latitude = coordinates[1];

    return {
      latitude,
      longitude,
    };
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null;
  }
}

export default geocodeAddress;