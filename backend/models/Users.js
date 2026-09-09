import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    avatar: {
      type: String, 
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "delivery", "admin"],
      default: "user",
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== "delivery";
      },
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
     isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: {
      type: String,      
      default: null,
    },
    emailOtpExpires: {
      type: Date,
      default: null,
    },
        resetPasswordOtp: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
userSchema.index({ role: 1 });

export const Users =  mongoose.model("User", userSchema);