import { Response } from "express";
import { ActivityService } from "../services/activity.service";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getActivities = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const isEmployee = req.user?.role === "EMPLOYEE";
  const userId = req.user?.id || req.user?.employeeId;
  const category = req.query.category as string | undefined;
  const action = req.query.action as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

  const activities = await ActivityService.getActivities({
    userId,
    isEmployeeRole: isEmployee,
    category,
    action,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, activities, "Activity logs fetched successfully"));
});

export const getActivityAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const isEmployee = req.user?.role === "EMPLOYEE";
  const userId = req.user?.id || req.user?.employeeId;

  const analytics = await ActivityService.getActivityAnalytics(userId, isEmployee);

  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Activity analytics fetched successfully"));
});

export const createActivityLog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || req.user?.employeeId || "usr_emp_02";
  const userName = req.user?.name || "Alex Rivera";
  const userRole = req.user?.role || "EMPLOYEE";

  const newLog = await ActivityService.logActivity({
    userId,
    userName,
    userRole,
    action: req.body.action || "CUSTOM_EVENT",
    category: req.body.category || "attendance",
    description: req.body.description || "Activity recorded",
    details: req.body.details,
    ipAddress: req.ip,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newLog, "Activity log created successfully"));
});
