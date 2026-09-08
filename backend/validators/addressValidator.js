import { z } from "zod";

const createAddressSchema = z.object({
  label: z.enum(["home", "work", "other"]).default("home"),
  flatOrBuilding: z.string().min(2, "Please enter your flat/house/building details"),
  locality: z.string().optional(),
  city: z.string().optional(), // relaxed — not every location has a clean "city" tag
  state: z.string().min(1, "State is required"),
  pincode: z.string().optional(), // some rural/less-mapped areas also lack this
  country: z.string().optional(),
  formattedAddress: z.string().min(1, "Address is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  isDefault: z.boolean().optional(),
});

const updateAddressSchema = createAddressSchema.partial();

export { createAddressSchema, updateAddressSchema };