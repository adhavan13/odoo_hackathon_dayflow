import { Response } from 'express';
import { CloudinaryService } from '../services/cloudinary.service';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const uploadFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a file');
  }

  const folder = (req.body.folder as string) || 'dayflow_uploads';
  const result = await CloudinaryService.uploadFile(req.file, folder);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'File uploaded to Cloudinary successfully'));
});
