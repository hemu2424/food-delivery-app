
// Google Maps API implementation (reference)
// async function searchAddress(query, limit = 5) {
//   if (!query || query.trim().length < 3) return [];
//   try {
//     const encodedQuery = encodeURIComponent(query);
//     const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedQuery}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
//     const response = await fetch(url);
//     const data = await response.json();
//     if (data.status !== "OK" || !data.predictions) return [];
//     return data.predictions.slice(0, limit).map((prediction) => ({
//       placeId: prediction.place_id,
//       description: prediction.description,
//     }));
//   } catch (error) {
//     console.error("Address search error:", error.message);
//     return [];
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

function extractFeatureDetails(feature) {
  const coordinates = getPointCoordinates(feature);
  const context = Array.isArray(feature.context) ? feature.context : [];

  function findContext(...targetTypes) {
    const match = context.find((item) => {
      const typeFromId = item.id ? item.id.split(".")[0].toLowerCase() : "";
      const typeFromKind = item.kind ? item.kind.toLowerCase() : "";
      return targetTypes.includes(typeFromId) || targetTypes.includes(typeFromKind);
    });
    return match ? match.text : "";
  }

  const country =
    findContext("country") ||
    (feature.properties?.country_code
      ? feature.properties.country_code.toUpperCase()
      : "") ||
    "India";
  const state =
    findContext("region") ||
    (feature.place_type?.includes("region") ? feature.text : "") ||
    "";
  const city =
    findContext("place", "municipality", "subregion", "county") ||
    (feature.place_type?.includes("place") ? feature.text : "") ||
    "";
  const locality =
    findContext(
      "locality",
      "neighborhood",
      "neighbourhood",
      "district",
      "municipal_district"
    ) ||
    (feature.place_type?.includes("locality") ||
    feature.place_type?.includes("poi")
      ? feature.text
      : "") ||
    "";
  const pincode = findContext("postal_code", "postcode") || "";

  return {
    placeId: feature.id || feature.properties?.ref || "",
    description: feature.place_name || feature.text || "",
    formattedAddress: feature.place_name || feature.text || "",
    latitude: coordinates[1] ?? null,
    longitude: coordinates[0] ?? null,
    city: city || locality || "Not specified",
    state: state || city || "Not specified",
    pincode,
    country,
    locality: locality || city || "",
  };
}

async function searchAddress(query, limit = 5) {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://api.maptiler.com/geocoding/${encodedQuery}.json?autocomplete=true&key=${process.env.MAPTILER_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        "MapTiler API error:",
        response.status,
        response.statusText
      );
      return [];
    }

    const data = await response.json();

    if (!data.features || !Array.isArray(data.features)) {
      return [];
    }

    return data.features.slice(0, limit).map(extractFeatureDetails);
  } catch (error) {
    console.error("Address search error:", error.message);
    return [];
  }
}

export default searchAddress;