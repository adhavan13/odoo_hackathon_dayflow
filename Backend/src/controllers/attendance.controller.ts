import { Response } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const punchIn = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = req.user?.id || 'emp_1';
  const employeeName = req.user?.name || 'Alex Rivera';
  const result = await AttendanceService.checkIn(employeeId, employeeName);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Check-in recorded successfully'));
});

export const punchOut = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = req.user?.id || 'emp_1';
  const result = await AttendanceService.checkOut(employeeId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Check-out recorded successfully'));
});

export const getTodayStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = req.user?.id || 'emp_1';
  const status = await AttendanceService.getTodayStatus(employeeId);
  return res
    .status(200)
    .json(new ApiResponse(200, status, 'Today attendance status fetched successfully'));
});

export const getAttendanceHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = req.query.employeeId as string | undefined;
  const history = await AttendanceService.getHistory(employeeId);
  return res
    .status(200)
    .json(new ApiResponse(200, history, 'Attendance history fetched successfully'));
});
