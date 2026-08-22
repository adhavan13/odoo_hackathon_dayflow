import { Router } from "express";
import {
  signupUser,
  verifyEmail,
  loginUser,
  getCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/signup", signupUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", authenticateToken, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
