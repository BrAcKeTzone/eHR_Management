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
exports.deleteProfilePicture = exports.updateProfilePicture = exports.checkEmailExists = exports.verifyOtpAndDeleteHr = exports.sendOtpForHrDeletion = exports.getUserStats = exports.deleteUser = exports.updateUserPassword = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const email_1 = __importDefault(require("../../utils/email"));
const client_2 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all users with pagination and filtering
const getAllUsers = async (options = {}) => {
    const { page = 1, limit = 10, role, search, sortBy = "createdAt", sortOrder = "desc", specialization, } = options;
    const skip = (page - 1) * limit;
    // Only allow valid sort fields
    const validSortFields = [
        "firstName",
        "lastName",
        "name",
        "email",
        "role",
        "createdAt",
    ];
    let sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    // Map firstName, lastName, and name to lastName for name sorting (standard practice)
    if (sortField === "firstName" ||
        sortField === "lastName" ||
        sortField === "name") {
        sortField = "lastName";
    }
    // Build where clause
    const where = {};
    if (role) {
        where.role = role;
    }
    if (specialization) {
        where.applications = {
            some: {
                specializationId: specialization,
            },
        };
    }
    if (search) {
        // Use case-insensitive search for MySQL
        const searchLower = search.toLowerCase();
        where.OR = [
            {
                firstName: {
                    contains: searchLower,
                },
            },
            {
                lastName: {
                    contains: searchLower,
                },
            },
            {
                email: {
                    contains: searchLower,
                },
            },
        ];
    }
    try {
        // Get total count for pagination
        const totalCount = await prisma.user.count({ where });
        // Build order by clause
        let orderByClause;
        if (sortField === "lastName") {
            // When sorting by name, sort by lastName then firstName
            orderByClause = [{ lastName: sortOrder }, { firstName: sortOrder }];
        }
        else {
            // For other fields, sort normally
            orderByClause = { [sortField]: sortOrder };
        }
        // Get users
        const users = await prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: orderByClause,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const totalPages = Math.ceil(totalCount / limit);
        return {
            users,
            totalCount,
            totalPages,
            currentPage: page,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }
    catch (err) {
        throw new ApiError_1.default(500, err.message || "Failed to fetch users");
    }
};
exports.getAllUsers = getAllUsers;
// Get user by ID
const getUserById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            profilePicture: true,
            profilePicturePublicId: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    return user;
};
exports.getUserById = getUserById;
// Create new user
const createUser = async (userData) => {
    const { email, password, firstName, lastName, phone, role = client_1.UserRole.APPLICANT, } = userData;
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new ApiError_1.default(400, "User with this email already exists");
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone: phone || null,
            role,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
};
exports.createUser = createUser;
// Update user
const updateUser = async (userId, userData, requestingUserId, requestingUserRole) => {
    const { email, firstName, lastName, phone, role } = userData;
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!existingUser) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Security check: Prevent role changes unless requesting user is HR
    if (role &&
        role !== existingUser.role &&
        requestingUserRole !== client_1.UserRole.HR) {
        throw new ApiError_1.default(403, "Only HR can change user roles");
    }
    // Security check: Prevent HR users from changing other HR users' roles
    if (existingUser.role === client_1.UserRole.HR &&
        role &&
        role !== client_1.UserRole.HR &&
        requestingUserId !== userId) {
        throw new ApiError_1.default(403, "Cannot change HR user role");
    }
    // If email is being updated, check for conflicts
    if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
            where: { email },
        });
        if (emailExists) {
            throw new ApiError_1.default(400, "User with this email already exists");
        }
    }
    // Prepare update data
    const updateData = {};
    if (email && email !== existingUser.email)
        updateData.email = email;
    if (firstName && firstName !== existingUser.firstName)
        updateData.firstName = firstName;
    if (lastName && lastName !== existingUser.lastName)
        updateData.lastName = lastName;
    if (phone !== undefined)
        updateData.phone = phone || null;
    if (role && role !== existingUser.role)
        updateData.role = role;
    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
        // Return existing user if no changes
        const { password: _, ...userWithoutPassword } = existingUser;
        return userWithoutPassword;
    }
    // Update user
    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
};
exports.updateUser = updateUser;
// Update user password
const updateUserPassword = async (userId, currentPassword, newPassword) => {
    // Get user with password
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Verify current password
    const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new ApiError_1.default(400, "Current password is incorrect");
    }
    // Hash new password
    const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
    // Update password
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });
    return { message: "Password updated successfully" };
};
exports.updateUserPassword = updateUserPassword;
// Delete user
const deleteUser = async (userId) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Prevent deletion of HR users for security
    if (user.role === client_1.UserRole.HR) {
        throw new ApiError_1.default(403, "Cannot delete HR users");
    }
    // Delete user (cascade will handle related records)
    await prisma.user.delete({
        where: { id: userId },
    });
    return { message: "User deleted successfully" };
};
exports.deleteUser = deleteUser;
// Get user statistics
const getUserStats = async () => {
    const total = await prisma.user.count();
    const hr = await prisma.user.count({ where: { role: client_1.UserRole.HR } });
    const applicants = await prisma.user.count({
        where: { role: client_1.UserRole.APPLICANT },
    });
    // Users created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = await prisma.user.count({
        where: {
            createdAt: {
                gte: thirtyDaysAgo,
            },
        },
    });
    return { total, hr, applicants, recent };
};
exports.getUserStats = getUserStats;
// Send OTP for HR deletion confirmation
const sendOtpForHrDeletion = async (hrEmail) => {
    // Verify HR user exists
    const hrUser = await prisma.user.findUnique({
        where: { email: hrEmail },
    });
    if (!hrUser || hrUser.role !== client_1.UserRole.HR) {
        throw new ApiError_1.default(403, "Only HR users can delete other HR users");
    }
    // Generate OTP
    const otpOptions = {
        upperCase: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
    };
    const otp = otp_generator_1.default.generate(6, otpOptions);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    try {
        // Store OTP in database
        await prisma.otp.create({
            data: {
                email: hrEmail,
                otp,
                createdAt: expires,
            },
        });
    }
    catch (error) {
        if (error instanceof client_2.Prisma.PrismaClientKnownRequestError) {
            throw new ApiError_1.default(400, "Failed to create OTP record");
        }
        throw error;
    }
    try {
        // Send OTP via email
        await (0, email_1.default)({
            email: hrEmail,
            subject: "OTP for HR User Deletion Confirmation",
            message: `Your OTP for deleting an HR user is: ${otp}. It will expire in 10 minutes. Do not share this OTP with anyone.`,
        });
    }
    catch (error) {
        console.error(error);
        throw new ApiError_1.default(500, "There was an error sending the email. Please try again later.");
    }
    return { message: "OTP sent to your email for HR deletion confirmation" };
};
exports.sendOtpForHrDeletion = sendOtpForHrDeletion;
// Verify OTP and delete HR user
const verifyOtpAndDeleteHr = async (userToDeleteId, requestingHrEmail, otp, requestingHrId, requestingUserRole) => {
    // Check if requesting user is HR
    if (requestingUserRole !== client_1.UserRole.HR) {
        throw new ApiError_1.default(403, "Only HR users can delete other HR users");
    }
    // Get the user to be deleted
    const userToDelete = await prisma.user.findUnique({
        where: { id: userToDeleteId },
    });
    if (!userToDelete) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Check if user to delete is HR
    if (userToDelete.role !== client_1.UserRole.HR) {
        throw new ApiError_1.default(403, "This user is not an HR. Use regular delete instead.");
    }
    // Prevent HR from deleting themselves
    if (userToDelete.id === requestingHrId) {
        throw new ApiError_1.default(403, "You cannot delete your own account");
    }
    // Verify OTP
    const otpRecord = await prisma.otp.findFirst({
        where: {
            email: requestingHrEmail,
            otp: otp,
        },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "Invalid OTP");
    }
    // Check if OTP is expired
    if (new Date() > otpRecord.createdAt) {
        throw new ApiError_1.default(400, "OTP has expired");
    }
    try {
        // Delete the HR user
        await prisma.user.delete({
            where: { id: userToDeleteId },
        });
        // Delete the OTP record after successful verification
        await prisma.otp.delete({
            where: { id: otpRecord.id },
        });
        return { message: "HR user deleted successfully" };
    }
    catch (error) {
        if (error instanceof client_2.Prisma.PrismaClientKnownRequestError) {
            throw new ApiError_1.default(400, "Failed to delete user");
        }
        throw error;
    }
};
exports.verifyOtpAndDeleteHr = verifyOtpAndDeleteHr;
// Check if email exists
const checkEmailExists = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    return !!user;
};
exports.checkEmailExists = checkEmailExists;
// Update profile picture
const updateProfilePicture = async (userId, file) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Delete old profile picture from Cloudinary if exists
    if (user.profilePicturePublicId) {
        try {
            const cloudinary = (await Promise.resolve().then(() => __importStar(require("../../../configs/cloudinary")))).default;
            await cloudinary.uploader.destroy(user.profilePicturePublicId);
        }
        catch (error) {
            console.error("Error deleting old profile picture:", error);
        }
    }
    // Update user with new profile picture
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            profilePicture: file.path || file.url,
            profilePicturePublicId: file.filename || file.public_id || "",
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            profilePicture: true,
            profilePicturePublicId: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return updatedUser;
};
exports.updateProfilePicture = updateProfilePicture;
// Delete profile picture
const deleteProfilePicture = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Delete profile picture from Cloudinary if exists
    if (user.profilePicturePublicId) {
        try {
            const cloudinary = (await Promise.resolve().then(() => __importStar(require("../../../configs/cloudinary")))).default;
            await cloudinary.uploader.destroy(user.profilePicturePublicId);
        }
        catch (error) {
            console.error("Error deleting profile picture:", error);
        }
    }
    // Update user to remove profile picture
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            profilePicture: null,
            profilePicturePublicId: null,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            profilePicture: true,
            profilePicturePublicId: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return updatedUser;
};
exports.deleteProfilePicture = deleteProfilePicture;
//# sourceMappingURL=users.service.js.map