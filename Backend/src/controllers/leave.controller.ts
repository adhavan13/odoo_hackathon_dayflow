import { Response } from 'express';
import { LeaveService } from '../services/leave.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getLeaveRequests = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  let employeeId = req.query.employeeId as string | undefined;
  let secondaryId: string | undefined = undefined;

  // Employees can only view their own leave requests
  if (req.user?.role === 'EMPLOYEE') {
    employeeId = req.user.id;
    secondaryId = req.user.employeeId;
  }

  const requests = await LeaveService.getLeaveRequests(employeeId, secondaryId);
  return res
    .status(200)
    .json(new ApiResponse(200, requests, 'Leave requests fetched successfully'));
});

export const getLeaveBalance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  let employeeId = req.user?.id || req.user?.employeeId || 'usr_emp_02';

  // HR/Admin can query balance for specific employees
  if ((req.user?.role === 'HR' || req.user?.role === 'ADMIN') && req.query.employeeId) {
    employeeId = req.query.employeeId as string;
  }

  const balance = await LeaveService.getLeaveBalance(employeeId);
  return res
    .status(200)
    .json(new ApiResponse(200, balance, 'Leave balance fetched successfully'));
});

export const applyLeave = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = req.body.employeeId || req.user?.id || req.user?.employeeId || 'usr_emp_02';
  const employeeName = req.body.employeeName || req.user?.name || 'Alex Rivera';
  const newLeave = await LeaveService.applyLeave({
    ...req.body,
    employeeId,
    employeeName,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newLeave, 'Leave application submitted successfully'));
});

export const updateLeaveStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Only Admins and HR Officers can approve or reject leave requests
  if (req.user?.role !== 'HR' && req.user?.role !== 'ADMIN') {
    return res
      .status(403)
      .json(new ApiResponse(403, null, 'Only Admins and HR Officers can approve or reject leave requests'));
  }

  const updated = await LeaveService.updateLeaveStatus(id, status);
  return res
    .status(200)
    .json(new ApiResponse(200, updated, `Leave request ${status} successfully`));
});

export const getHolidays = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const holidays = await LeaveService.getHolidays();
  return res
    .status(200)
    .json(new ApiResponse(200, holidays, 'Company holidays fetched successfully'));
});

export const createHoliday = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { date, name } = req.body;
  if (!date || !name) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'Date and name are required for company holiday'));
  }
  const newHoliday = await LeaveService.createHoliday(date, name);
  return res
    .status(201)
    .json(new ApiResponse(201, newHoliday, 'Company holiday announcement created successfully'));
});
