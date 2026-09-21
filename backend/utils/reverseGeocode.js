// async function reverseGeocode(latitude, longitude) {
//   try {
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

//     const response = await fetch(url);
//     const data = await response.json();

//     if (data.status !== "OK" || !data.results || data.results.length === 0) {
//       return null;
//     }

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

// export default reverseGeocode;
// ---------------------------------------------------------------above for google map api-----------------------------

async function reverseGeocode(latitude, longitude) {
  try {
    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
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

    console.log("MapTiler reverse geocode response:", data);

    if (
      !data.features ||
      !Array.isArray(data.features) ||
      data.features.length === 0
    ) {
      return null;
    }

    const result = data.features[0];

    const coordinates = result.geometry?.coordinates || [];
    const context = result.context || [];

    function findContext(...kinds) {
      const match = context.find((item) => kinds.includes(item.kind));
      return match ? match.text : "";
    }

    const city =
      findContext("place", "municipality") ||
      findContext("subregion");

    const state = findContext("region");

    const country = findContext("country");

    const locality =
      findContext("locality") ||
      findContext("neighborhood") ||
      findContext("district");

    const pincode = findContext("postcode");

    return {
      formattedAddress: result.place_name || "",

      latitude,
      longitude,

      city,
      state,
      pincode,
      country,
      locality,
    };
  } catch (error) {
    console.error("Reverse geocode error:", error.message);
    return null;
  }
}

export default reverseGeocode;