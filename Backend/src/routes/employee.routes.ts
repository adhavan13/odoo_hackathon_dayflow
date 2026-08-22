import { Router } from "express";
import {
  getEmployees,
  getEmployeeById,
  createEmployeeController,
  updateEmployeeProfile,
} from "../controllers/employee.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
  getEmployeeSalary,
  updateEmployeeSalary,
  getMySalary,
} from "../controllers/payroll.controller";

const router = Router();

router.use(authenticateToken);

router.get("/me/salary", getMySalary);
router.get("/:id/salary", getEmployeeSalary);
router.put("/:id/salary", updateEmployeeSalary);
router.get("/", getEmployees);
router.post("/", createEmployeeController);
router.get("/:id", getEmployeeById);
router.patch("/:id", updateEmployeeProfile);

export default router;
