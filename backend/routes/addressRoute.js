import express from "express";
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  searchAddressSuggestions,
  reverseGeocodeLocation,
  getPlaceDetailsEndpoint,
} from "../controllers/addressController.js";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { createAddressSchema, updateAddressSchema } from "../validators/addressValidator.js";

const router = express.Router();

// Public endpoints for address search, reverse geocoding & place details
router.get("/search", searchAddressSuggestions);
router.get("/reverse-geocode", reverseGeocodeLocation);
router.get("/place-details", getPlaceDetailsEndpoint);

// Protected endpoints (requires auth)
router.use(protect);

router.get("/", getMyAddresses);
router.post("/", validate(createAddressSchema), createAddress);
router.put("/:id", validate(updateAddressSchema), updateAddress);
router.delete("/:id", deleteAddress);
router.put("/:id/set-default", setDefaultAddress);

export default router;