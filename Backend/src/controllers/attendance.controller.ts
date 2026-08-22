import { Response } from "express";
import { AttendanceService } from "../services/attendance.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ApiError } from "../utils/apiError";

const currentUser = (req: AuthenticatedRequest) => {
  if (!req.user?.id) throw new ApiError(401, "Authenticated user is missing.");
  return req.user;
};

export const punchIn = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = currentUser(req);
    const result = await AttendanceService.checkIn(
      user.id,
      user.name,
      req.body.source,
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Check-in successful",
        attendance: result,
      });
  },
);

export const punchOut = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AttendanceService.checkOut(currentUser(req).id);
    return res
      .status(200)
      .json({
        success: true,
        message: "Check-out successful",
        attendance: result,
      });
  },
);

export const getTodayStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AttendanceService.getTodayStatus(currentUser(req).id);
    return res.status(200).json({ success: true, attendance: result });
  },
);

export const getAttendanceHistory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const history = await AttendanceService.getHistory(
      req.query.employeeId as string | undefined,
    );
    return res
      .status(200)
      .json({
        success: true,
        data: history,
        message: "Attendance history fetched successfully",
      });
  },
);

export const getMyAttendance = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AttendanceService.getMyAttendance(
      currentUser(req).id,
      req.query.month as string | undefined,
    );
    return res.status(200).json({ success: true, ...result });
  },
);

export const startBreak = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AttendanceService.startBreak(currentUser(req).id);
    return res
      .status(200)
      .json({
        success: true,
        message: "Break started",
        break: { id: result.id, startTime: result.startTime },
      });
  },
);

export const endBreak = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AttendanceService.endBreak(currentUser(req).id);
    return res
      .status(200)
      .json({
        success: true,
        break: {
          startTime: result.startTime,
          endTime: result.endTime,
          duration: result.duration,
        },
      });
  },
);

export const getAdminToday = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AttendanceService.getTodayForAdmin(
      req.query.search as string | undefined,
      req.query.date as string | undefined,
      req.query.status as string | undefined,
      req.query.department as string | undefined,
    );
    return res.status(200).json({ success: true, ...result });
  },
);

export const getEmployeeAttendance = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AttendanceService.getEmployeeAttendance(
      req.params.employeeId,
      req.query.month as string | undefined,
    );
    return res.status(200).json({ success: true, ...result });
  },
);

export const getPayableDays = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AttendanceService.getPayableDays(
      req.params.employeeId,
      req.query.month as string | undefined,
    );
    return res.status(200).json({ success: true, ...result });
  },
);
