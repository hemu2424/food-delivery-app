import { z } from "zod";


const createRestaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  // A location is required because new restaurants are geocoded before saving.
  address: z.string().trim().min(5, "Enter a complete restaurant address"),
  deliveryRadiusKm: z.coerce.number().min(1).optional(),
});


const updateRestaurantSchema = createRestaurantSchema
  .extend({
  
    isActive: z
      .transform((val) => val === "true")
      .optional(),
  })
  .partial();

export { createRestaurantSchema, updateRestaurantSchema };
