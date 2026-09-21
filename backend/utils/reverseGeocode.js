// Google Maps API implementation (reference)
// async function reverseGeocode(latitude, longitude) {
//   try {
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
//     const response = await fetch(url);
//     const data = await response.json();
//     if (data.status !== "OK" || !data.results || data.results.length === 0) return null;
//     const result = data.results[0];
//     const components = result.address_components || [];
//     function findComponent(type) {
//       const match = components.find((c) => c.types.includes(type));
//       return match ? match.long_name : "";
//     }
//     return {
//       formattedAddress: result.formatted_address,
//       latitude,
//       longitude,
//       city: findComponent("locality") || findComponent("administrative_area_level_2"),
//       state: findComponent("administrative_area_level_1"),
//       pincode: findComponent("postal_code"),
//       country: findComponent("country"),
//       locality: findComponent("sublocality") || findComponent("neighborhood"),
//     };
//   } catch (error) {
//     console.error("Reverse geocode error:", error.message);
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

async function reverseGeocode(latitude, longitude) {
  try {
    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return null;
    }

    const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${process.env.MAPTILER_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        "MapTiler reverse geocoding error:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();

    if (
      !data.features ||
      !Array.isArray(data.features) ||
      data.features.length === 0
    ) {
      return null;
    }

    const feature = data.features[0];
    const coordinates = getPointCoordinates(feature);
    const parsedLat = coordinates.length >= 2 ? coordinates[1] : Number(latitude);
    const parsedLng = coordinates.length >= 2 ? coordinates[0] : Number(longitude);
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
      formattedAddress: feature.place_name || feature.text || "",
      latitude: coordinates[1] ?? latitude,
      longitude: coordinates[0] ?? longitude,
      city: city || locality || "Not specified",
      state: state || city || "Not specified",
      pincode,
      country,
      locality: locality || city || "",
    };
  } catch (error) {
    console.error("Reverse geocode error:", error.message);
    return null;
  }
}

export default reverseGeocode;