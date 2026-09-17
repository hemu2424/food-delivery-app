// async function getPlaceDetails(placeId) {
//   try {
//     const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,address_component&key=${process.env.GOOGLE_MAPS_API_KEY}`;

//     const response = await fetch(url);
//     const data = await response.json();

//     if (data.status !== "OK" || !data.result) {
//       return null;
//     }

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

// export default getPlaceDetails;
// ---------------------------------------------------------------above for google map api-----------------------------
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

    console.log("MapTiler place details response:", data);

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

    function findContext(...types) {
      const match = context.find((item) => {
        if (types.includes(item.kind)) {
          return true;
        }

        return false;
      });

      return match ? match.text : "";
    }

    const country = findContext("country");
    const state = findContext("region");
    const city =
      findContext("place") ||
      findContext("municipality") ||
      findContext("subregion");

    const locality =
      findContext("locality") ||
      findContext("neighborhood") ||
      findContext("district");

    const pincode = findContext("postcode");

    return {
      formattedAddress: result.place_name || "",
      latitude: coordinates[1] ?? null,
      longitude: coordinates[0] ?? null,

      city,
      state,
      pincode,
      country,
      locality,
    };
  } catch (error) {
    console.error("Place details error:", error.message);
    return null;
  }
}

export default getPlaceDetails;