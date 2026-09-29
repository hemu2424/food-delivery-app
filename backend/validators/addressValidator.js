import { z } from "zod";

const labelEnum = z.enum(["home", "work", "other"]);

// Shared fields with NO defaults, so a partial update never injects values
const baseAddressSchema = z.object({
  label: labelEnum,
  flatOrBuilding: z.string().min(2, "Please enter your flat/house/building details"),
  locality: z.string().optional(),
  city: z.string().optional(), // relaxed — not every location has a clean "city" tag
  state: z.string().optional(),
  pincode: z.string().optional(), // some rural/less-mapped areas also lack this
  country: z.string().optional(),
  formattedAddress: z.string().min(1, "Address is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  isDefault: z.boolean().optional(),
});

// Creating: label falls back to "home" when the client doesn't send one
const createAddressSchema = baseAddressSchema.extend({
  label: labelEnum.default("home"),
});

// Updating: every field optional, and no defaults get applied
const updateAddressSchema = baseAddressSchema.partial();

export { createAddressSchema, updateAddressSchema };