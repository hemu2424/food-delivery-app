import { z } from "zod";

const orderItemSchema = z.object({
  menuItem: z.string().min(1, "menuItem ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});




const updateStatusSchema = z.object({
  status: z.enum(["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]),
});
const createOrderSchema = z.object({
  restaurant: z.string().min(1, "Restaurant ID is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  paymentMethod: z.enum(["cod", "razorpay"]).optional(),
});
const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
const CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Delivery is taking too long",
  "Found a better price elsewhere",
  "Other",
];

const DELIVERY_CANCEL_REASONS = [
  "Restaurant is closed",
  "Unable to reach the location in time",
  "Vehicle breakdown",
  "Restaurant is not ready",
  "Other",
];

const cancelOrderSchema = z.object({
  reason: z.enum(CANCEL_REASONS),
  note: z.string().max(300).optional(),
});

const deliveryCancelSchema = z.object({
  reason: z.enum(DELIVERY_CANCEL_REASONS),
  note: z.string().max(300).optional(),
});

export { createOrderSchema, updateStatusSchema,orderItemSchema ,verifyPaymentSchema, cancelOrderSchema, deliveryCancelSchema};