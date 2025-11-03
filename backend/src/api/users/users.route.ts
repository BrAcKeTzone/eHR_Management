import express from "express";
import * as usersController from "./users.controller";
import * as usersValidation from "./users.validation";
import validate from "../../middlewares/validate.middleware";
import auth from "../../middlewares/auth.middleware";
import {
  requireHR,
  requireOwnershipOrHR,
  requireModificationRights,
} from "../../middlewares/rbac.middleware";

const router = express.Router();

// GET /api/users/check-email - Check if email exists (PUBLIC - no auth required)
router.get("/check-email", usersController.checkEmailExists);

// All user routes require authentication
router.use(auth);

// GET /api/users/me - Get current user profile (must be before /:id)
router.get("/me", usersController.getCurrentUser);

// GET /api/users/stats - Get user statistics (HR only) (must be before /:id)
router.get("/stats", requireHR, usersController.getUserStats);

// POST /api/users/hr-deletion/send-otp - Send OTP for HR deletion (HR only) (must be before /:id)
router.post(
  "/hr-deletion/send-otp",
  requireHR,
  usersController.sendOtpForHrDeletion
);

// GET /api/users - Get all users with pagination and filtering (HR only)
router.get(
  "/",
  requireHR,
  validate(usersValidation.getUsersQuery, "query"),
  usersController.getAllUsers
);

// GET /api/users/:id - Get user by ID (HR or own profile)
router.get("/:id", requireOwnershipOrHR, usersController.getUserById);

// POST /api/users - Create new user (HR only)
router.post(
  "/",
  requireHR,
  validate(usersValidation.createUser),
  usersController.createUser
);

// PUT /api/users/me - Update current user profile
router.put(
  "/me",
  validate(usersValidation.updateUser),
  usersController.updateCurrentUser
);

// PUT /api/users/:id - Update user (HR for others, or own profile)
router.put(
  "/:id",
  requireModificationRights,
  validate(usersValidation.updateUser),
  usersController.updateUser
);

// PUT /api/users/:id/password - Update user password (own profile only)
router.put(
  "/:id/password",
  requireOwnershipOrHR,
  validate(usersValidation.updateUserPassword),
  usersController.updateUserPassword
);

// DELETE /api/users/:id - Delete user (HR only, cannot delete HR users)
router.delete("/:id", requireHR, usersController.deleteUser);

// POST /api/users/:id/verify-and-delete-hr - Verify OTP and delete HR user (HR only)
router.post(
  "/:id/verify-and-delete-hr",
  requireHR,
  validate(usersValidation.verifyOtpForDeletion),
  usersController.verifyOtpAndDeleteHr
);

export default router;
