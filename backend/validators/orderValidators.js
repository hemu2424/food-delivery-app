import { z } from "zod";

const orderItemSchema = z.object({
  menuItem: z.string().min(1, "menuItem ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

const createOrderSchema = z.object({
  restaurant: z.string().min(1, "Restaurant ID is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
});


const updateStatusSchema = z.object({
  status: z.enum(["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]),
});

export { createOrderSchema, updateStatusSchema };