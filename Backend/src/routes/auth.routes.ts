import { Router } from "express";
import {
  signupUser,
  verifyEmail,
  sendVerificationOtp,
  verifyEmailOtp,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/signup", signupUser);
router.get("/verify-email", verifyEmail);
router.post("/send-verification-otp", sendVerificationOtp);
router.post("/resend-verification-otp", sendVerificationOtp);
router.post("/verify-email", verifyEmailOtp);
router.post("/login", loginUser);
router.get("/me", authenticateToken, getCurrentUser);
router.patch("/me", authenticateToken, updateCurrentUser);
router.post("/logout", authenticateToken, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
