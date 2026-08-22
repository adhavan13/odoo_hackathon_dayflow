import { Response } from 'express';
import { PayrollService } from '../services/payroll.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getSalarySlips = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = req.query.employeeId as string | undefined;
  const slips = await PayrollService.getSalarySlips(employeeId);
  return res
    .status(200)
    .json(new ApiResponse(200, slips, 'Salary slips retrieved successfully'));
});

export const getSalaryStructure = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = (req.query.employeeId as string) || req.user?.id || 'emp_1';
  const structure = await PayrollService.getSalaryStructure(employeeId);
  return res
    .status(200)
    .json(new ApiResponse(200, structure, 'Salary structure retrieved successfully'));
});

export const getPayrollOverview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const overview = await PayrollService.getPayrollOverview();
  return res
    .status(200)
    .json(new ApiResponse(200, overview, 'Payroll overview retrieved successfully'));
});

export const updateSalaryStructure = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employeeId = (req.body.employeeId as string) || (req.query.employeeId as string) || req.user?.id;
  if (!employeeId) throw new Error('Employee ID is required');
  
  if (req.user?.role !== 'HR') {
    return res.status(403).json(new ApiResponse(403, null, 'Only HR Admin can update salary structure'));
  }
  
  const structure = await PayrollService.updateSalaryStructure(employeeId, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, structure, 'Salary structure updated successfully'));
});
