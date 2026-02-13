"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotifications = exports.markAllAsRead = exports.markAsRead = exports.getNotificationById = exports.getNotifications = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const prisma_1 = __importDefault(require("../../configs/prisma"));
const client_1 = require("@prisma/client");
// Get notifications for the current user
exports.getNotifications = (0, asyncHandler_1.default)(async (req, res) => {
    const requestingUser = req.user;
    let whereClause = {};
    // Filter by role
    if (requestingUser.role === "HR" || requestingUser.role === "ADMIN") {
        // HR sees notifications with type "hr_alert"
        whereClause.type = "hr_alert";
    }
    else {
        // Applicants see notifications matching their email
        whereClause.email = requestingUser.email;
    }
    // Get all notifications with the filter
    const notifications = await prisma_1.default.notification.findMany({
        where: whereClause,
        orderBy: {
            createdAt: "desc",
        },
    });
    // Count unread notifications
    const unreadCount = await prisma_1.default.notification.count({
        where: {
            ...whereClause,
            status: client_1.NotificationStatus.UNREAD,
        },
    });
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { notifications, unreadCount }, "Notifications retrieved successfully"));
});
// Get a single notification by ID
exports.getNotificationById = (0, asyncHandler_1.default)(async (req, res) => {
    const notificationId = parseInt(req.params.id);
    const requestingUser = req.user;
    const notification = await prisma_1.default.notification.findUnique({
        where: { id: notificationId },
    });
    if (!notification) {
        res
            .status(404)
            .json(new ApiResponse_1.default(404, null, "Notification not found"));
        return;
    }
    // Check if user has permission to view this notification
    if (requestingUser.role === "HR" || requestingUser.role === "ADMIN") {
        if (notification.type !== "hr_alert") {
            res.status(403).json(new ApiResponse_1.default(403, null, "Access denied"));
            return;
        }
    }
    else {
        if (notification.email !== requestingUser.email) {
            res.status(403).json(new ApiResponse_1.default(403, null, "Access denied"));
            return;
        }
    }
    res
        .status(200)
        .json(new ApiResponse_1.default(200, notification, "Notification retrieved successfully"));
});
// Mark a notification as read
exports.markAsRead = (0, asyncHandler_1.default)(async (req, res) => {
    const notificationId = parseInt(req.params.id);
    const requestingUser = req.user;
    const notification = await prisma_1.default.notification.findUnique({
        where: { id: notificationId },
    });
    if (!notification) {
        res.status(404).json(new ApiResponse_1.default(404, null, "Notification not found"));
        return;
    }
    // Check if user has permission to update this notification
    if (requestingUser.role === "HR" || requestingUser.role === "ADMIN") {
        if (notification.type !== "hr_alert") {
            res.status(403).json(new ApiResponse_1.default(403, null, "Access denied"));
            return;
        }
    }
    else {
        if (notification.email !== requestingUser.email) {
            res.status(403).json(new ApiResponse_1.default(403, null, "Access denied"));
            return;
        }
    }
    const updatedNotification = await prisma_1.default.notification.update({
        where: { id: notificationId },
        data: { status: client_1.NotificationStatus.READ },
    });
    res
        .status(200)
        .json(new ApiResponse_1.default(200, updatedNotification, "Notification marked as read"));
});
// Mark all notifications as read
exports.markAllAsRead = (0, asyncHandler_1.default)(async (req, res) => {
    const requestingUser = req.user;
    let whereClause = { status: client_1.NotificationStatus.UNREAD };
    // Filter by role
    if (requestingUser.role === "HR" || requestingUser.role === "ADMIN") {
        whereClause.type = "hr_alert";
    }
    else {
        whereClause.email = requestingUser.email;
    }
    const result = await prisma_1.default.notification.updateMany({
        where: whereClause,
        data: { status: client_1.NotificationStatus.READ },
    });
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { count: result.count }, "All notifications marked as read"));
});
// Delete notifications
exports.deleteNotifications = (0, asyncHandler_1.default)(async (req, res) => {
    const requestingUser = req.user;
    const { ids } = req.body; // Array of notification IDs to delete
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res
            .status(400)
            .json(new ApiResponse_1.default(400, null, "Invalid notification IDs"));
        return;
    }
    // Get notifications to verify permissions
    const notifications = await prisma_1.default.notification.findMany({
        where: { id: { in: ids } },
    });
    // Check permissions for each notification
    for (const notification of notifications) {
        if (requestingUser.role === "HR" || requestingUser.role === "ADMIN") {
            if (notification.type !== "hr_alert") {
                res
                    .status(403)
                    .json(new ApiResponse_1.default(403, null, "Access denied for some notifications"));
                return;
            }
        }
        else {
            if (notification.email !== requestingUser.email) {
                res
                    .status(403)
                    .json(new ApiResponse_1.default(403, null, "Access denied for some notifications"));
                return;
            }
        }
    }
    const result = await prisma_1.default.notification.deleteMany({
        where: { id: { in: ids } },
    });
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { count: result.count }, "Notifications deleted successfully"));
});
//# sourceMappingURL=notifications.controller.js.map