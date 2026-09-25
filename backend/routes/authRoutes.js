import express from "express"

import { changePassword, forgotPassword, getProfile, login, logout, register, resendOtp, resetPassword, updateProfile, verifyEmail } from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resendOtpSchema, resetPasswordSchema, verifyEmailSchema } from "../validators/authValidation.js";
import upload from "../middlewares/upload.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);

router.post("/logout", logout);
router.post("/verify-email", authLimiter, validate(verifyEmailSchema), verifyEmail);
router.post("/resend-otp", authLimiter, validate(resendOtpSchema), resendOtp);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
router.put("/change-password", protect, changePassword);
router.put("/me", protect, upload.single("avatar"), updateProfile);

router.get("/me", protect, getProfile);

export default router;