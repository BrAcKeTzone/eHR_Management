import { Request, Response } from "express";
import * as usersService from "./users.service";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";

// Get all users with pagination and filtering
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const options = {
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    role: req.query.role as any,
    search: req.query.search as string,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as "asc" | "desc",
  };

  const result = await usersService.getAllUsers(options);
  res
    .status(200)
    .json(new ApiResponse(200, result, "Users retrieved successfully"));
});

// Get current user profile
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const requestingUser = (req as any).user;
    const user = await usersService.getUserById(requestingUser.id);
    res
      .status(200)
      .json(new ApiResponse(200, user, "Profile retrieved successfully"));
  }
);

// Get user by ID
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const user = await usersService.getUserById(userId);
  res
    .status(200)
    .json(new ApiResponse(200, user, "User retrieved successfully"));
});

// Create new user
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.createUser(req.body);
  res.status(201).json(new ApiResponse(201, user, "User created successfully"));
});

// Update current user profile
export const updateCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const requestingUser = (req as any).user;
    const user = await usersService.updateUser(
      requestingUser.id,
      req.body,
      requestingUser.id,
      requestingUser.role
    );
    res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  }
);

// Update user
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const requestingUser = (req as any).user;
  const user = await usersService.updateUser(
    userId,
    req.body,
    requestingUser?.id,
    requestingUser?.role
  );
  res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

// Update user password
export const updateUserPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;

    const result = await usersService.updateUserPassword(
      userId,
      currentPassword,
      newPassword
    );
    res
      .status(200)
      .json(new ApiResponse(200, result, "Password updated successfully"));
  }
);

// Delete user
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const result = await usersService.deleteUser(userId);
  res
    .status(200)
    .json(new ApiResponse(200, result, "User deleted successfully"));
});

// Get user statistics
export const getUserStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await usersService.getUserStats();
    res
      .status(200)
      .json(
        new ApiResponse(200, stats, "User statistics retrieved successfully")
      );
  }
);
