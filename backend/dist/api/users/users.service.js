"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.deleteUser = exports.updateUserPassword = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const prisma = new client_1.PrismaClient();
// Get all users with pagination and filtering
const getAllUsers = async (options = {}) => {
    const { page = 1, limit = 10, role, search, sortBy = "createdAt", sortOrder = "desc", } = options;
    const skip = (page - 1) * limit;
    // Only allow valid sort fields
    const validSortFields = ["name", "email", "role", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    // Build where clause
    const where = {};
    if (role) {
        where.role = role;
    }
    if (search) {
        // Use case-insensitive search for MySQL
        const searchLower = search.toLowerCase();
        where.OR = [
            {
                name: {
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
        // Get users
        const users = await prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortField]: sortOrder },
            select: {
                id: true,
                email: true,
                name: true,
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
            name: true,
            phone: true,
            role: true,
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
    const { email, password, name, phone, role = client_1.UserRole.APPLICANT } = userData;
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
            name,
            phone: phone || null,
            role,
        },
        select: {
            id: true,
            email: true,
            name: true,
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
    const { email, name, phone, role } = userData;
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
    if (name && name !== existingUser.name)
        updateData.name = name;
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
            name: true,
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
//# sourceMappingURL=users.service.js.map