import { Response } from 'express';
import { EmployeeService } from '../services/employee.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getEmployees = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employees = await EmployeeService.getAllEmployees();
  return res
    .status(200)
    .json(new ApiResponse(200, employees, 'Employees retrieved successfully'));
});

export const getEmployeeById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const employee = await EmployeeService.getEmployeeById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, employee, 'Employee profile retrieved successfully'));
});

export const updateEmployeeProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updated = await EmployeeService.updateEmployeeProfile(id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, updated, 'Employee profile updated successfully'));
});
