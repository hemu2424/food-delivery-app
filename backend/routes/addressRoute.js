import express from "express";
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  searchAddressSuggestions,
} from "../controllers/addressController.js";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { createAddressSchema, updateAddressSchema } from "../validators/addressValidator.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyAddresses);
router.get("/search", searchAddressSuggestions);
router.post("/", validate(createAddressSchema), createAddress);
router.put("/:id", validate(updateAddressSchema), updateAddress);
router.delete("/:id", deleteAddress);
router.put("/:id/set-default", setDefaultAddress);

export default router;