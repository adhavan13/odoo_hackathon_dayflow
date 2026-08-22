import { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const loginUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email = 'alex.rivera@company.com', role = 'admin' } = req.body;
  const result = await AuthService.login(email, role);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'User logged in successfully'));
});

export const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr_emp_02';
  const profile = await AuthService.getProfile(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, profile, 'User profile fetched successfully'));
});

export const logoutUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'User logged out successfully'));
});
