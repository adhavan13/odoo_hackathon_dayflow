import { Router } from "express";
import authRoutes from "./auth.routes";
import employeeRoutes from "./employee.routes";
import attendanceRoutes from "./attendance.routes";
import leaveRoutes from "./leave.routes";
import payrollRoutes from "./payroll.routes";
import uploadRoutes from "./upload.routes";
import aiAssistantRoutes from "./aiAssistant.routes";
import activityRoutes from "./activity.routes";
import announcementRoutes from "./announcement.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leave", leaveRoutes);
router.use("/payroll", payrollRoutes);
router.use("/upload", uploadRoutes);
router.use("/ai-assistant", aiAssistantRoutes);
router.use("/activity", activityRoutes);
router.use("/announcements", announcementRoutes);

export default router;
