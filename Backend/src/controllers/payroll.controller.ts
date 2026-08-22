import { Request, Response } from "express";
import { PayrollService } from "../services/payroll.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ApiError } from "../utils/apiError";

const userId = (req: AuthenticatedRequest) => {
  if (!req.user?.id) throw new ApiError(401, "Authenticated user is missing.");
  return req.user;
};
const adminOnly = (req: AuthenticatedRequest) => {
  const user = userId(req);
  if (user.role !== "ADMIN" && user.role !== "HR")
    throw new ApiError(403, "Only ADMIN or HR can access this payroll.");
  return user;
};

export const getPayroll = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = adminOnly(req);
    const [year, month] = String(
      req.query.month ||
        `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
    ).split("-");
    const result = await PayrollService.getAll(
      Number(month),
      Number(year),
      user.companyId,
      req.query.search as string | undefined,
    );
    res
      .status(200)
      .json({
        success: true,
        data: result,
        message: "Payroll records retrieved successfully",
      });
  },
);
export const getPayrollById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = adminOnly(req);
    const result = await PayrollService.getById(
      req.params.payrollId,
      user.companyId,
    );
    res.status(200).json({ success: true, data: result });
  },
);
export const getEmployeePayroll = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = adminOnly(req);
    const result = await PayrollService.getEmployee(
      req.params.employeeId,
      req.query.month
        ? Number(String(req.query.month).split("-")[1])
        : new Date().getMonth() + 1,
      req.query.month
        ? Number(String(req.query.month).split("-")[0])
        : new Date().getFullYear(),
      user.companyId,
    );
    if (!result)
      throw new ApiError(
        404,
        "Payroll not generated for this employee and month.",
      );
    res.status(200).json({ success: true, data: result });
  },
);
export const generatePayroll = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = adminOnly(req);
    const result = await PayrollService.generate(
      req.body.month,
      req.body.year,
      user.companyId,
    );
    res
      .status(201)
      .json({
        success: true,
        data: result,
        message: "Payroll generated successfully",
      });
  },
);
export const getEmployeeSalary = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = adminOnly(req);
    const result = await PayrollService.getSalaryStructure(
      req.params.employeeId || req.params.id,
      user.companyId,
    );
    res.status(200).json({ success: true, data: result });
  },
);
export const updateEmployeeSalary = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = adminOnly(req);
    const result = await PayrollService.updateSalaryStructure(
      req.params.employeeId || req.params.id,
      req.body,
      user.companyId,
    );
    res
      .status(200)
      .json({
        success: true,
        data: result,
        message: "Salary structure updated successfully",
      });
  },
);
export const getMySalary = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = userId(req);
    const result = await PayrollService.getSalaryStructure(
      user.id,
      user.companyId,
    );
    res.status(200).json({ success: true, data: result });
  },
);
export const getMyPayroll = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = userId(req);
    const month = String(
      req.query.month ||
        `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
    );
    const [year, monthNumber] = month.split("-").map(Number);
    const result = await PayrollService.getEmployee(
      user.id,
      monthNumber,
      year,
      user.companyId,
    );
    if (!result)
      throw new ApiError(404, "Payroll has not been generated for this month.");
    res.status(200).json({ success: true, data: result });
  },
);
export const getMyCurrentPayroll = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = userId(req);
    const records = await PayrollService.getAll(
      new Date().getMonth() + 1,
      new Date().getFullYear(),
      user.companyId,
    );
    const result = records.find((record) => record.employeeId === user.id);
    if (!result)
      throw new ApiError(404, "Current payroll has not been generated.");
    res.status(200).json({ success: true, data: result });
  },
);
export const getPayslip = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = userId(req);
    const result = await PayrollService.payslip(
      req.params.payrollId,
      user.role === "ADMIN" || user.role === "HR"
        ? user.companyId
        : user.companyId,
    );
    if (user.role === "EMPLOYEE" && result.payroll.employeeId !== user.id)
      throw new ApiError(403, "You are not authorized to access this payslip.");
    res.status(200).json({ success: true, data: result });
  },
);
export const finalizePayroll = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = adminOnly(req);
    const result = await PayrollService.finalize(
      req.params.payrollId,
      user.companyId,
    );
    res
      .status(200)
      .json({
        success: true,
        data: result,
        message: "Payroll finalized successfully",
      });
  },
);

export const getSalarySlips = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await PayrollService.getSalarySlips(
      req.query.employeeId as string | undefined,
    );
    res
      .status(200)
      .json({
        success: true,
        data: result,
        message: "Salary slips retrieved successfully",
      });
  },
);
export const getSalaryStructure = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = userId(req);
    const employeeId = (req.query.employeeId as string) || user.id;
    if (user.role === "EMPLOYEE" && employeeId !== user.id)
      throw new ApiError(403, "You are not authorized to access this salary.");
    const result = await PayrollService.getSalaryStructure(
      employeeId,
      user.companyId,
    );
    res.status(200).json({ success: true, data: result });
  },
);
export const getPayrollOverview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    adminOnly(req);
    const result = await PayrollService.getPayrollOverview();
    res.status(200).json({ success: true, data: result });
  },
);
export const updateSalaryStructure = updateEmployeeSalary;
