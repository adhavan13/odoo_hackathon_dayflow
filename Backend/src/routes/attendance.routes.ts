import { Router } from "express";
import {
  punchIn,
  punchOut,
  getTodayStatus,
  getAttendanceHistory,
  getMyAttendance,
  startBreak,
  endBreak,
  getAdminToday,
  getEmployeeAttendance,
  getPayableDays,
} from "../controllers/attendance.controller";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/me", getMyAttendance);
router.get("/me/today", getTodayStatus);
router.post("/punch-in", punchIn);
router.post("/punch-out", punchOut);
router.post("/check-in", punchIn);
router.post("/check-out", punchOut);
router.post("/break/start", startBreak);
router.post("/break/end", endBreak);
router.get("/today", requireRole(["ADMIN", "HR"]), getAdminToday);
router.get("/history", getAttendanceHistory);
router.get(
  "/employees/:employeeId/payable-days",
  requireRole(["ADMIN", "HR"]),
  getPayableDays,
);
router.get(
  "/employees/:employeeId",
  requireRole(["ADMIN", "HR"]),
  getEmployeeAttendance,
);

export default router;
