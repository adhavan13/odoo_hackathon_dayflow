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
  const { employeeId, email, password, role } = req.body;
  const result = await AuthService.signup(employeeId, email, password, role);
  return res.status(201).json({
    success: true,
    message: "Signup successful. Please verify your email.",
    ...result,
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.verifyEmail(req.query.token as string);
  return res
    .status(200)
    .json({ success: true, message: "Email verified successfully" });
});

export const getCurrentUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Authenticated user is missing.");
    const profile = await AuthService.getProfile(userId);
    return res.status(200).json({ success: true, user: profile });
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
    const token = await AuthService.forgotPassword(req.body.email);
    return res.status(200).json({
      success: true,
      message: "If that email exists, a password reset link has been sent.",
      ...(token ? { resetToken: token } : {}),
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    await AuthService.resetPassword(req.body.token, req.body.password);
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  },
);
