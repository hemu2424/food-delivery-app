import { z } from "zod";

const createMenuItemSchema = z.object({
  restaurant: z.string().min(1, "Restaurant ID is required"),
  name: z.string().min(2, "Item name must be at least 2 characters"),
  description: z.string().optional(),

  price: z.coerce.number().min(0, "Price must be 0 or more"),
  category: z.string().optional(),
});

const updateMenuItemSchema = createMenuItemSchema
  .extend({
    isAvailable: z
      .union([z.literal("true"), z.literal("false")])
      .transform((val) => val === "true")
      .optional(),
  })
  .partial();

export { createMenuItemSchema, updateMenuItemSchema };