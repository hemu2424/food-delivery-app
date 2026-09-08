import express from "express";
import {
    createMenuItem,
  updateMenuItem,
  deleteMenuItemImage,
  deleteMenuItem,
} from "../controllers/menuItemController.js";
import { protect, allowRoles } from "../middlewares/auth.js";
import { createMenuItemSchema, updateMenuItemSchema } from "../validators/menuItemValidators.js";
import upload from "../middlewares/upload.js";
import validate from "../middlewares/validate.js";

const router = express.Router();


const uploadMenuItemImages = upload.fields([{ name: "images", maxCount: 5 }]);
router.post(
  "/",
  protect,
  allowRoles("admin"),
  uploadMenuItemImages,
  validate(createMenuItemSchema),
  createMenuItem
);

router.put(
  "/:id",
  protect,
  allowRoles("admin"),
  uploadMenuItemImages,
  validate(updateMenuItemSchema),
  updateMenuItem
);

router.delete("/:id/images", protect, allowRoles("admin"), deleteMenuItemImage);
router.delete("/:id", protect, allowRoles("admin"), deleteMenuItem);

export default router;
