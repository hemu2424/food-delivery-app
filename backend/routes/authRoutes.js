import express from "express"

import { forgotPassword, getProfile, login, logout, register, resendOtp, resetPassword, verifyEmail } from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resendOtpSchema, resetPasswordSchema, verifyEmailSchema } from "../validators/authValidation.js";


const router = express.Router();


router.post("/register",validate(registerSchema),register);
router.post("/login",validate(loginSchema),login);

router.post("/logout",logout);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);



router.get("/me",protect,getProfile);



export default router;