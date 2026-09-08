
async function reverseGeocode(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

    const response = await fetch(url, {
      headers: { "User-Agent": "FoodExpressApp/1.0 (learning project)" },
    });

    if (!response.ok) return null;

    const result = await response.json();
    if (!result || result.error) return null;

    return {
      formattedAddress: result.display_name,
      latitude,
      longitude,
      city: result.address?.city || result.address?.town || result.address?.village || "",
      state: result.address?.state || "",
      pincode: result.address?.postcode || "",
      country: result.address?.country || "",
      locality: result.address?.suburb || result.address?.neighbourhood || result.address?.road || "",
    };
  } catch (error) {
    console.error("Reverse geocode error:", error.message);
    return null;
  }
}

export default reverseGeocode;