import { Response } from 'express';
import { AiAssistantService } from '../services/aiAssistant.service';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const processQuery = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { query, localEmployees } = req.body;
  if (!query || typeof query !== 'string') {
    throw new ApiError(400, 'Query string is required.');
  }

  const userId = req.user?.id || 'emp_guest';
  const role = req.user?.role || 'EMPLOYEE';
  const userName = req.user?.name || req.user?.email || 'User';

  const assistantMessage = await AiAssistantService.processQuery(query, userId, role, userName, localEmployees);

  return res.status(200).json(
    new ApiResponse(200, assistantMessage, 'AI Assistant query processed successfully')
  );
});

export const getSuggestions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const role = req.user?.role || 'EMPLOYEE';
  const suggestions = AiAssistantService.getSuggestions(role);

  return res.status(200).json(
    new ApiResponse(200, suggestions, 'AI Assistant suggestions fetched successfully')
  );
});

export const getHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'emp_guest';
  const history = await AiAssistantService.getHistory(userId);

  return res.status(200).json(
    new ApiResponse(200, history, 'AI Assistant chat history fetched successfully')
  );
});

export const clearHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'emp_guest';
  await AiAssistantService.clearHistory(userId);

  return res.status(200).json(
    new ApiResponse(200, null, 'AI Assistant chat history cleared successfully')
  );
});
