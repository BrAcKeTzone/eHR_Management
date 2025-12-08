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
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../configs/cloudinary";

const router = express.Router();

// Configure multer for profile picture uploads
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any) => {
    const timestamp = Date.now();
    const userId = req.user?.id || "unknown";
    return {
      folder: "hr-applications/profile-pictures",
      public_id: `profile_${userId}_${timestamp}`,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
      ],
    };
  },
});

const profilePictureUpload = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed."
        ),
        false
      );
    }
  },
});

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

// POST /api/users/me/profile-picture - Upload profile picture
router.post(
  "/me/profile-picture",
  profilePictureUpload.single("profilePicture"),
  usersController.uploadProfilePicture
);

// DELETE /api/users/me/profile-picture - Delete profile picture
router.delete("/me/profile-picture", usersController.deleteProfilePicture);

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
