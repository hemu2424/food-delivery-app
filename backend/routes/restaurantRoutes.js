import express from "express"
import { allowRoles, protect } from "../middlewares/auth.js";
import {
  createRestaurant,
  deleteRestaurant,
  deleteRestaurantImage,
  geocodeAddressEndpoint,
  getCuisines,
  getNearbyRestaurants,
  getRestaurantById,
  getRestaurants,
  updateRestaurant,
} from "../controllers/restaurantController.js";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
} from "../validators/restaurantValidation.js";
import validate from "../middlewares/validate.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

const uploadRestaurantFiles = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "video", maxCount: 1 },
]);

router.get("/",getRestaurants);
router.get("/cuisines", getCuisines);
router.get("/nearby", getNearbyRestaurants);

router.get("/geocode", geocodeAddressEndpoint);

router.get("/:id",getRestaurantById);

router.post("/", protect, allowRoles("admin"), uploadRestaurantFiles, validate(createRestaurantSchema), createRestaurant);

router.put(
  "/:id",
  protect,
  allowRoles("admin"),
  uploadRestaurantFiles,
  validate(updateRestaurantSchema),
  updateRestaurant
);

router.delete("/:id/images", protect, allowRoles("admin"), deleteRestaurantImage);

router.delete("/:id", protect, allowRoles("admin"), deleteRestaurant);

export default router
