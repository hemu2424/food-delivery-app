
// Google Maps API implementation (reference)
// async function geocodeAddress(address) {
//   if (!address || address.trim().length === 0) return null;
//   try {
//     const encodedAddress = encodeURIComponent(address);
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
//     const response = await fetch(url);
//     const data = await response.json();
//     if (data.status !== "OK" || !data.results || data.results.length === 0) return null;
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

function getPointCoordinates(feature) {
  if (feature.center && Array.isArray(feature.center) && typeof feature.center[0] === "number") {
    return feature.center;
  }
  let coords = feature.geometry?.coordinates;
  if (!coords || !Array.isArray(coords)) return [];
  while (Array.isArray(coords) && coords.length > 0 && Array.isArray(coords[0])) {
    coords = coords[0];
  }
  return typeof coords[0] === "number" && typeof coords[1] === "number" ? coords : [];
}

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
        "MapTiler geocoding API error:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();

    if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const coordinates = getPointCoordinates(feature);

    if (!coordinates || coordinates.length < 2) {
      return null;
    }

    // GeoJSON coordinates format: [longitude, latitude]
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