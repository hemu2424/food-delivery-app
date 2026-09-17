
// async function searchAddress(query, limit = 5) {
//   if (!query || query.trim().length < 3) {
//     return [];
//   }
//   console.log("Searching for address:", query);

//   try {
//     const encodedQuery = encodeURIComponent(query);
//     // const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedQuery}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
//   


//     const response = await fetch(url);
//     const data = await response.json();

//     if (data.status !== "OK" || !data.predictions) {
//       return [];
//     }
//     console.log("Address search results:", data.predictions);

//     return data.predictions.slice(0, limit).map((prediction) => ({
//       placeId: prediction.place_id,
//       description: prediction.description,
//     }));
//   } catch (error) {
//     console.error("Address search error:", error.message);
//     return [];
//   }
//   console.log("Address search completed for query:", query);
// }

// export default searchAddress;


// use below code for maptiler api  -------------------------------------------------and above for google maps api

async function searchAddress(query, limit = 5) {
  if (!query || query.trim().length < 3) {
    return [];
  }

  console.log("Searching for address:", query);

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

    console.log("MapTiler response:", data);


    if (!data.features || !Array.isArray(data.features)) {
      return [];
    }

    const results = data.features.slice(0, limit).map((feature) => {
      const coordinates = feature.geometry?.coordinates || [];

      return {
        placeId: feature.id || feature.properties?.ref || null,

        description: feature.place_name || feature.text || "",

        latitude: coordinates[1] ?? null,

        longitude: coordinates[0] ?? null,
      };
    });

    console.log("Address search results:", results);

    return results;
  } catch (error) {
    console.error("Address search error:", error.message);
    return [];
  }
}

export default searchAddress;