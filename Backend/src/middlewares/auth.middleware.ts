import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.config";
import { ApiError } from "../utils/apiError";
import { AuthService } from "../services/auth.service";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    employeeId: string;
    companyId?: string;
    role: "ADMIN" | "HR" | "EMPLOYEE";
    name?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next(
        new ApiError(401, "Access denied. No authentication token provided."),
      );
    }

    if (await AuthService.isTokenRevoked(token)) {
      return next(new ApiError(401, "Session has been logged out."));
    }

    const decoded = jwt.verify(
      token,
      config.jwtSecret,
    ) as AuthenticatedRequest["user"];
    req.user = decoded;
    next();
  } catch {
    return next(new ApiError(401, "Invalid or expired authentication token."));
  }
};

export const requireRole = (roles: Array<"ADMIN" | "HR" | "EMPLOYEE">) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden. Insufficient permissions."));
    }
    next();
  };
};
