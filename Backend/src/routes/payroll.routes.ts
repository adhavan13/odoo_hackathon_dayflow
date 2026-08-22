import { Router } from "express";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";
import {
  getPayroll,
  getPayrollById,
  getEmployeePayroll,
  generatePayroll,
  getEmployeeSalary,
  updateEmployeeSalary,
  getMySalary,
  getMyPayroll,
  getMyCurrentPayroll,
  getPayslip,
  finalizePayroll,
  getSalarySlips,
  getSalaryStructure,
  getPayrollOverview,
} from "../controllers/payroll.controller";

const router = Router();
router.use(authenticateToken);

router.get("/", requireRole(["ADMIN", "HR"]), getPayroll);
router.get("/me", getMyPayroll);
router.get("/me/current", getMyCurrentPayroll);
router.get("/me/payslip/:payrollId", getPayslip);
router.get("/:payrollId/payslip", getPayslip);
router.get("/:payrollId", requireRole(["ADMIN", "HR"]), getPayrollById);
router.get(
  "/employees/:employeeId",
  requireRole(["ADMIN", "HR"]),
  getEmployeePayroll,
);
router.post("/generate", requireRole(["ADMIN", "HR"]), generatePayroll);
router.post(
  "/:payrollId/finalize",
  requireRole(["ADMIN", "HR"]),
  finalizePayroll,
);

router.get("/slips", getSalarySlips);
router.get("/structure", getSalaryStructure);
router.put("/structure", requireRole(["ADMIN", "HR"]), updateEmployeeSalary);
router.get("/overview", requireRole(["ADMIN", "HR"]), getPayrollOverview);

export default router;
