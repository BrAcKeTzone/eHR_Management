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
exports.deleteProfilePicture = exports.uploadProfilePicture = exports.getUserStats = exports.checkEmailExists = exports.verifyOtpAndDeleteHr = exports.sendOtpForHrDeletion = exports.deleteUser = exports.updateUserPassword = exports.updateUser = exports.updateCurrentUser = exports.createUser = exports.getUserById = exports.getCurrentUser = exports.getAllUsers = void 0;
const usersService = __importStar(require("./users.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
// Get all users with pagination and filtering
exports.getAllUsers = (0, asyncHandler_1.default)(async (req, res) => {
    const options = {
        page: req.query.page ? parseInt(req.query.page) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        role: req.query.role,
        search: req.query.search,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        specialization: req.query.specialization ? parseInt(req.query.specialization) : undefined,
    };
    const result = await usersService.getAllUsers(options);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Users retrieved successfully"));
});
// Get current user profile
exports.getCurrentUser = (0, asyncHandler_1.default)(async (req, res) => {
    const requestingUser = req.user;
    const user = await usersService.getUserById(requestingUser.id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, user, "Profile retrieved successfully"));
});
// Get user by ID
exports.getUserById = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await usersService.getUserById(userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, user, "User retrieved successfully"));
});
// Create new user
exports.createUser = (0, asyncHandler_1.default)(async (req, res) => {
    const user = await usersService.createUser(req.body);
    res.status(201).json(new ApiResponse_1.default(201, user, "User created successfully"));
});
// Update current user profile
exports.updateCurrentUser = (0, asyncHandler_1.default)(async (req, res) => {
    const requestingUser = req.user;
    const user = await usersService.updateUser(requestingUser.id, req.body, requestingUser.id, requestingUser.role);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, user, "Profile updated successfully"));
});
// Update user
exports.updateUser = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.id);
    const requestingUser = req.user;
    const user = await usersService.updateUser(userId, req.body, requestingUser?.id, requestingUser?.role);
    res.status(200).json(new ApiResponse_1.default(200, user, "User updated successfully"));
});
// Update user password
exports.updateUserPassword = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;
    const result = await usersService.updateUserPassword(userId, currentPassword, newPassword);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Password updated successfully"));
});
// Delete user
exports.deleteUser = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.id);
    const result = await usersService.deleteUser(userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "User deleted successfully"));
});
// Send OTP for deleting an HR user
exports.sendOtpForHrDeletion = (0, asyncHandler_1.default)(async (req, res) => {
    const requestingUser = req.user;
    const result = await usersService.sendOtpForHrDeletion(requestingUser.email);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "OTP sent to your email for HR deletion confirmation"));
});
// Verify OTP and delete HR user
exports.verifyOtpAndDeleteHr = (0, asyncHandler_1.default)(async (req, res) => {
    const userToDeleteId = parseInt(req.params.id);
    const requestingUser = req.user;
    const { otp } = req.body;
    const result = await usersService.verifyOtpAndDeleteHr(userToDeleteId, requestingUser.email, otp, requestingUser.id, requestingUser.role);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "HR user deleted successfully after OTP verification"));
});
// Check if email exists
exports.checkEmailExists = (0, asyncHandler_1.default)(async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res
            .status(400)
            .json(new ApiResponse_1.default(400, null, "Email is required"));
    }
    const exists = await usersService.checkEmailExists(email);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { exists }, exists ? "Email already exists" : "Email is available"));
});
// Get user statistics
exports.getUserStats = (0, asyncHandler_1.default)(async (req, res) => {
    const stats = await usersService.getUserStats();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, stats, "User statistics retrieved successfully"));
});
// Upload profile picture
exports.uploadProfilePicture = (0, asyncHandler_1.default)(async (req, res) => {
    const requestingUser = req.user;
    const file = req.file;
    if (!file) {
        return res
            .status(400)
            .json(new ApiResponse_1.default(400, null, "No file uploaded"));
    }
    const result = await usersService.updateProfilePicture(requestingUser.id, file);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Profile picture updated successfully"));
});
// Delete profile picture
exports.deleteProfilePicture = (0, asyncHandler_1.default)(async (req, res) => {
    const requestingUser = req.user;
    const result = await usersService.deleteProfilePicture(requestingUser.id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Profile picture deleted successfully"));
});
//# sourceMappingURL=users.controller.js.map