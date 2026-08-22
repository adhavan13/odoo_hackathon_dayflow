import { Router } from "express";
import {
  getActivities,
  getActivityAnalytics,
  createActivityLog,
} from "../controllers/activity.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getActivities);
router.get("/analytics", getActivityAnalytics);
router.post("/", createActivityLog);

export default router;
