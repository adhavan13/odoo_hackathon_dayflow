import { Request, Response } from "express";
import { AnnouncementService } from "../services/announcement.service";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const announcements = await AnnouncementService.getAnnouncements();
  return res
    .status(200)
    .json(new ApiResponse(200, announcements, "Announcements fetched successfully"));
});

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, category, department, authorName, isPinned } = req.body;
  if (!title || !content) {
    return res.status(400).json(new ApiResponse(400, null, "Title and content are required"));
  }

  const newAnc = await AnnouncementService.createAnnouncement({
    title,
    content,
    category: category || "General",
    department: department || "All Departments",
    authorName: authorName || "Admin",
    isPinned: Boolean(isPinned),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newAnc, "Announcement published successfully"));
});

export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AnnouncementService.deleteAnnouncement(id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Announcement deleted successfully"));
});
