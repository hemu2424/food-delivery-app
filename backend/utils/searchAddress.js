
async function searchAddress(query, limit = 5) {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedQuery}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.predictions) {
      return [];
    }

    return data.predictions.slice(0, limit).map((prediction) => ({
      placeId: prediction.place_id,
      description: prediction.description,
    }));
  } catch (error) {
    console.error("Address search error:", error.message);
    return [];
  }
}

export default searchAddress;



