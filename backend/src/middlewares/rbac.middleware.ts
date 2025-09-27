import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

// Type definitions for user with role
interface AuthenticatedUser {
  id: number;
  email: string;
  role: "HR" | "APPLICANT";
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Check if user has HR role
export const requireHR = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (req.user.role !== "HR") {
    return next(new ApiError(403, "HR access required"));
  }

  next();
};

// Check if user is accessing their own resource or is HR
export const requireOwnershipOrHR = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  const userId = parseInt(req.params.id);

  // Allow if user is HR or accessing their own resource
  if (req.user.role === "HR" || req.user.id === userId) {
    return next();
  }

  return next(
    new ApiError(403, "Access denied. You can only access your own resources")
  );
};

// Check if user can modify the target user
export const requireModificationRights = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  const userId = parseInt(req.params.id);

  // HR can modify anyone except other HR users (checked in service layer)
  // Users can only modify themselves
  if (req.user.role === "HR" || req.user.id === userId) {
    return next();
  }

  return next(new ApiError(403, "Access denied. Insufficient permissions"));
};

export default {
  requireHR,
  requireOwnershipOrHR,
  requireModificationRights,
};
