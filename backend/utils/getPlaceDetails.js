async function getPlaceDetails(placeId) {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,address_component&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.result) {
      return null;
    }

    const result = data.result;
    const components = result.address_components || [];

    function findComponent(type) {
      const match = components.find((c) => c.types.includes(type));
      return match ? match.long_name : "";
    }

    return {
      formattedAddress: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      city: findComponent("locality") || findComponent("administrative_area_level_2"),
      state: findComponent("administrative_area_level_1"),
      pincode: findComponent("postal_code"),
      country: findComponent("country"),
      locality: findComponent("sublocality") || findComponent("neighborhood"),
    };
  } catch (error) {
    console.error("Place details error:", error.message);
    return null;
  }
}

export default getPlaceDetails;