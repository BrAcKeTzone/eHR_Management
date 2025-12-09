"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersController = __importStar(require("./users.controller"));
const usersValidation = __importStar(require("./users.validation"));
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const rbac_middleware_1 = require("../../middlewares/rbac.middleware");
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../../configs/cloudinary"));
const router = express_1.default.Router();
// Configure multer for profile picture uploads
const profilePictureStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req) => {
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
const profilePictureUpload = (0, multer_1.default)({
    storage: profilePictureStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed."), false);
        }
    },
});
// GET /api/users/check-email - Check if email exists (PUBLIC - no auth required)
router.get("/check-email", usersController.checkEmailExists);
// All user routes require authentication
router.use(auth_middleware_1.default);
// GET /api/users/me - Get current user profile (must be before /:id)
router.get("/me", usersController.getCurrentUser);
// GET /api/users/stats - Get user statistics (HR only) (must be before /:id)
router.get("/stats", rbac_middleware_1.requireHR, usersController.getUserStats);
// POST /api/users/hr-deletion/send-otp - Send OTP for HR deletion (HR only) (must be before /:id)
router.post("/hr-deletion/send-otp", rbac_middleware_1.requireHR, usersController.sendOtpForHrDeletion);
// GET /api/users - Get all users with pagination and filtering (HR only)
router.get("/", rbac_middleware_1.requireHR, (0, validate_middleware_1.default)(usersValidation.getUsersQuery, "query"), usersController.getAllUsers);
// GET /api/users/:id - Get user by ID (HR or own profile)
router.get("/:id", rbac_middleware_1.requireOwnershipOrHR, usersController.getUserById);
// POST /api/users - Create new user (HR only)
router.post("/", rbac_middleware_1.requireHR, (0, validate_middleware_1.default)(usersValidation.createUser), usersController.createUser);
// PUT /api/users/me - Update current user profile
router.put("/me", (0, validate_middleware_1.default)(usersValidation.updateUser), usersController.updateCurrentUser);
// POST /api/users/me/profile-picture - Upload profile picture
router.post("/me/profile-picture", profilePictureUpload.single("profilePicture"), usersController.uploadProfilePicture);
// DELETE /api/users/me/profile-picture - Delete profile picture
router.delete("/me/profile-picture", usersController.deleteProfilePicture);
// PUT /api/users/:id - Update user (HR for others, or own profile)
router.put("/:id", rbac_middleware_1.requireModificationRights, (0, validate_middleware_1.default)(usersValidation.updateUser), usersController.updateUser);
// PUT /api/users/:id/password - Update user password (own profile only)
router.put("/:id/password", rbac_middleware_1.requireOwnershipOrHR, (0, validate_middleware_1.default)(usersValidation.updateUserPassword), usersController.updateUserPassword);
// DELETE /api/users/:id - Delete user (HR only, cannot delete HR users)
router.delete("/:id", rbac_middleware_1.requireHR, usersController.deleteUser);
// POST /api/users/:id/verify-and-delete-hr - Verify OTP and delete HR user (HR only)
router.post("/:id/verify-and-delete-hr", rbac_middleware_1.requireHR, (0, validate_middleware_1.default)(usersValidation.verifyOtpForDeletion), usersController.verifyOtpAndDeleteHr);
exports.default = router;
//# sourceMappingURL=users.route.js.map