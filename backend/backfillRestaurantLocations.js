

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Restaurant from "./models/Restaurant.js";
import geocodeAddress from "./utils/geocode.js";

async function backfillLocations() {
  await connectDB();


  const restaurants = await Restaurant.find({
    $or: [{ location: { $exists: false } }, { "location.coordinates": { $size: 0 } }],
  });

  console.log(`Found ${restaurants.length} restaurant(s) needing geocoding.`);

  for (const restaurant of restaurants) {
    console.log(`Geocoding: ${restaurant.name} — "${restaurant.address}"`);

    const geocoded = await geocodeAddress(restaurant.address);

    if (!geocoded) {
      console.warn(`  Could not geocode "${restaurant.address}" — skipping this restaurant.`);
      continue;
    }

    restaurant.location = {
      type: "Point",
      coordinates: [geocoded.longitude, geocoded.latitude],
    };

    if (!restaurant.deliveryRadiusKm) {
      restaurant.deliveryRadiusKm = 5;
    }

    await restaurant.save();
    console.log(`  Success: [${geocoded.latitude}, ${geocoded.longitude}]`);


    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("Backfill complete.");
  await mongoose.disconnect();
}

backfillLocations().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});