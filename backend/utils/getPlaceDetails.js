// Google Maps API implementation (reference)
// async function getPlaceDetails(placeId) {
//   try {
//     const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,address_component&key=${process.env.GOOGLE_MAPS_API_KEY}`;
//     const response = await fetch(url);
//     const data = await response.json();
//     if (data.status !== "OK" || !data.result) return null;
//     const result = data.result;
//     const components = result.address_components || [];
//     function findComponent(type) {
//       const match = components.find((c) => c.types.includes(type));
//       return match ? match.long_name : "";
//     }
//     return {
//       formattedAddress: result.formatted_address,
//       latitude: result.geometry.location.lat,
//       longitude: result.geometry.location.lng,
//       city: findComponent("locality") || findComponent("administrative_area_level_2"),
//       state: findComponent("administrative_area_level_1"),
//       pincode: findComponent("postal_code"),
//       country: findComponent("country"),
//       locality: findComponent("sublocality") || findComponent("neighborhood"),
//     };
//   } catch (error) {
//     console.error("Place details error:", error.message);
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

async function getPlaceDetails(placeId) {
  if (!placeId) {
    return null;
  }

  try {
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      placeId
    )}.json?key=${process.env.MAPTILER_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        "MapTiler Place Details API error:",
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

    let feature = data.features[0];
    let coordinates = getPointCoordinates(feature);

    // If ID lookup feature lacks context, enrich via reverse geocoding
    if (
      (!feature.context || feature.context.length === 0) &&
      coordinates.length >= 2
    ) {
      try {
        const revUrl = `https://api.maptiler.com/geocoding/${coordinates[0]},${coordinates[1]}.json?key=${process.env.MAPTILER_API_KEY}`;
        const revResponse = await fetch(revUrl);
        if (revResponse.ok) {
          const revData = await revResponse.json();
          if (revData.features && revData.features.length > 0) {
            feature = {
              ...revData.features[0],
              place_name:
                feature.place_name || revData.features[0].place_name,
            };
            coordinates = getPointCoordinates(feature);
          }
        }
      } catch (enrichErr) {
        console.warn("Context enrichment error:", enrichErr.message);
      }
    }

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
      latitude: coordinates[1] ?? null,
      longitude: coordinates[0] ?? null,
      city: city || locality || "Not specified",
      state: state || city || "Not specified",
      pincode,
      country,
      locality: locality || city || "",
    };
  } catch (error) {
    console.error("Place details error:", error.message);
    return null;
  }
}

export default getPlaceDetails;