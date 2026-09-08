import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    cuisine: { type: String, default: "General" },
    address: { type: String, default: "" },
    images: { type: [String], default: [] },
    video: { type: String, default: null },
    isActive: { type: Boolean, default: true },

    location: {
      type: {
        type: String,
        enum: ["Point"], 
        default: "Point",
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
    },

  
    deliveryRadiusKm: {
      type: Number,
      default: 5,
      min: 1,
    },
  },
  { timestamps: true }
);


restaurantSchema.index({ location: "2dsphere" });


restaurantSchema.index({ isActive: 1 });

export default mongoose.model("Restaurant", restaurantSchema);