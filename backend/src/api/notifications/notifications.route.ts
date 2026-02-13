import { Router } from "express";
import * as notificationsController from "./notifications.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Mark all notifications as read (must come before :id routes)
router.patch("/mark-all-read", notificationsController.markAllAsRead);

// Get all notifications for the current user
router.get("/", notificationsController.getNotifications);

// Get a single notification by ID
router.get("/:id", notificationsController.getNotificationById);

// Mark a notification as read
router.patch("/:id/read", notificationsController.markAsRead);

// Delete notifications (bulk delete)
router.delete("/", notificationsController.deleteNotifications);

export default router;
