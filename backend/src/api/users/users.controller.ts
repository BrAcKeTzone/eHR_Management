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
    specialization: req.query.specialization
      ? parseInt(req.query.specialization as string)
      : undefined,
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
  },
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
      requestingUser.role,
    );
    res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  },
);

// Update user
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const requestingUser = (req as any).user;
  const user = await usersService.updateUser(
    userId,
    req.body,
    requestingUser?.id,
    requestingUser?.role,
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
      newPassword,
    );
    res
      .status(200)
      .json(new ApiResponse(200, result, "Password updated successfully"));
  },
);

// Delete user
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const result = await usersService.deleteUser(userId);
  res
    .status(200)
    .json(new ApiResponse(200, result, "User deleted successfully"));
});

// Send OTP for deleting an HR user
export const sendOtpForHrDeletion = asyncHandler(
  async (req: Request, res: Response) => {
    const requestingUser = (req as any).user;
    const result = await usersService.sendOtpForHrDeletion(
      requestingUser.email,
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "OTP sent to your email for HR deletion confirmation",
        ),
      );
  },
);

// Verify OTP and delete HR user
export const verifyOtpAndDeleteHr = asyncHandler(
  async (req: Request, res: Response) => {
    const userToDeleteId = parseInt(req.params.id);
    const requestingUser = (req as any).user;
    const { otp } = req.body;

    const result = await usersService.verifyOtpAndDeleteHr(
      userToDeleteId,
      requestingUser.email,
      otp,
      requestingUser.id,
      requestingUser.role,
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "HR user deleted successfully after OTP verification",
        ),
      );
  },
);

// Check if email exists
export const checkEmailExists = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.query;
    if (!email) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email is required"));
    }

    const exists = await usersService.checkEmailExists(email as string);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { exists },
          exists ? "Email already exists" : "Email is available",
        ),
      );
  },
);

// Get user statistics
export const getUserStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await usersService.getUserStats();
    res
      .status(200)
      .json(
        new ApiResponse(200, stats, "User statistics retrieved successfully"),
      );
  },
);

// Upload profile picture
export const uploadProfilePicture = asyncHandler(
  async (req: Request, res: Response) => {
    const requestingUser = (req as any).user;
    const file = (req as any).file;

    if (!file) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "No file uploaded"));
    }

    const result = await usersService.updateProfilePicture(
      requestingUser.id,
      file,
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Profile picture updated successfully"),
      );
  },
);

// Delete profile picture
export const deleteProfilePicture = asyncHandler(
  async (req: Request, res: Response) => {
    const requestingUser = (req as any).user;
    const result = await usersService.deleteProfilePicture(requestingUser.id);
    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Profile picture deleted successfully"),
      );
  },
);
