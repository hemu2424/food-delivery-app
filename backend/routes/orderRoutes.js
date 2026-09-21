import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAvailableOrders,
  getMyDeliveries,
  acceptOrder,
  downloadInvoice,
  verifyPayment,
  markPickedUp,
  cancelAssignedOrder,
  cancelOrder,
} from "../controllers/orderController.js";

import { allowRoles, protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { cancelOrderSchema, createOrderSchema, deliveryCancelSchema, updateStatusSchema, verifyPaymentSchema } from "../validators/orderValidators.js";

const router = express.Router();


router.post("/", protect, allowRoles("user"), validate(createOrderSchema), createOrder);
router.get("/my", protect, allowRoles("user"), getMyOrders);
router.get("/available", protect, allowRoles("delivery"), getAvailableOrders);
router.get("/delivery/my", protect, allowRoles("delivery"), getMyDeliveries);
router.get("/", protect, allowRoles("admin"), getAllOrders);
router.put("/:id/pickup", protect, allowRoles("delivery"), markPickedUp);
router.put("/:id/cancel-delivery", protect, allowRoles("delivery"), validate(deliveryCancelSchema), cancelAssignedOrder);
router.put("/:id/cancel", protect, allowRoles("user"), validate(cancelOrderSchema), cancelOrder);

router.get("/:id", protect, getOrderById);
router.put(
  "/:id/status",
  protect,
  allowRoles("admin", "delivery"),
  validate(updateStatusSchema),
  updateOrderStatus
);
router.put("/:id/accept", protect, allowRoles("delivery"), acceptOrder);

router.get("/:id/invoice", protect, downloadInvoice);
router.post("/:id/verify-payment", protect, allowRoles("user"), validate(verifyPaymentSchema), verifyPayment);

export default router;