import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ApiError } from "../utils/apiError";

export const loginUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    return res
      .status(200)
      .json({ success: true, message: "Login successful", ...result });
  },
);

export const signupUser = asyncHandler(async (req: Request, res: Response) => {
  const { companyName, name, email, phone, password, confirmPassword, logo } =
    req.body;
  const result = await AuthService.signup(
    companyName,
    name,
    email,
    phone,
    password,
    confirmPassword,
    logo,
  );
  console.log("Signup result:", result); // Debugging line
  return res.status(201).json({
    ...result,
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.verifyEmail(req.query.token as string);
  return res
    .status(200)
    .json({ success: true, message: "Email verified successfully" });
});

export const sendVerificationOtp = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await AuthService.sendVerificationOtp(req.body.email);
    return res.status(200).json({
      message: "Verification OTP sent successfully to your email.",
      ...result,
    });
  },
);

export const verifyEmailOtp = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await AuthService.verifyEmailOtp(req.body.email, req.body.otp);
    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully", ...result });
  },
);

export const getCurrentUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Authenticated user is missing.");
    const profile = await AuthService.getProfile(userId);
    return res.status(200).json({ success: true, user: profile });
  },
);

export const updateCurrentUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Authenticated user is missing.");
    const updated = await AuthService.updateProfile(userId, req.body);
    return res.status(200).json({ success: true, user: updated, message: "Profile updated successfully" });
  },
);

export const logoutUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) await AuthService.revokeToken(token);
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  },
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const token = await AuthService.forgotPassword(email);
    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, password reset instructions have been sent.",
      resetToken: token,
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  },
);
