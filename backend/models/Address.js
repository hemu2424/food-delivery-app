import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    flatOrBuilding: {
      type: String,
      required: true, // e.g. "Flat 402, B Wing" — the one thing search can't tell us
    },
    locality: {
      type: String,
      default: "", // area/street, comes from the search result the user picked
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "India",
    },
    formattedAddress: {
      type: String,
      required: true, // the full human-readable string from the search result
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

addressSchema.index({ user: 1 });
addressSchema.index({ location: "2dsphere" });

export default mongoose.model("Address", addressSchema);