import express from "express";
import {
  getAllCustomers,
  getAllDeliveryPartners,
  toggleBlockUser,
  approveDeliveryPartner,
  getDashboardStats,
} from "../controllers/adminController.js";
import { allowRoles, protect } from "../middlewares/auth.js";

const router = express.Router();


router.use(protect, allowRoles("admin"));

router.get("/stats", getDashboardStats);
router.get("/customers", getAllCustomers);
router.get("/delivery-partners", getAllDeliveryPartners);
router.put("/users/:id/block", toggleBlockUser);
router.put("/delivery-partners/:id/approve", approveDeliveryPartner);

export default router;