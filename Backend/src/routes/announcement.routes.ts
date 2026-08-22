import { Router } from "express";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Public/Auth routes for fetching announcements
router.get("/", getAnnouncements);
router.post("/", authenticateToken, createAnnouncement);
router.delete("/:id", authenticateToken, deleteAnnouncement);

export default router;
