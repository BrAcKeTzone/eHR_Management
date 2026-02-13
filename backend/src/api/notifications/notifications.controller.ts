import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import prisma from "../../configs/prisma";
import { NotificationStatus } from "@prisma/client";

// Get notifications for the current user
export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const requestingUser = (req as any).user;

    let whereClause: any = {};

    // Filter by role
    if (requestingUser.role === "HR" || requestingUser.role === "ADMIN") {
      // HR sees notifications with type "hr_alert"
      whereClause.type = "hr_alert";
    } else {
      // Applicants see notifications matching their email
      whereClause.email = requestingUser.email;
    }

    // Get all notifications with the filter
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        ...whereClause,
        status: NotificationStatus.UNREAD,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { notifications, unreadCount },
          "Notifications retrieved successfully",
        ),
      );
  },
);

// Get a single notification by ID
export const getNotificationById = asyncHandler(
  async (req: Request, res: Response) => {
    const notificationId = parseInt(req.params.id);
    const requestingUser = (req as any).user;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      res
        .status(404)
        .json(new ApiResponse(404, null, "Notification not found"));
      return;
    }

    // Check if user has permission to view this notification
    if (requestingUser.role === "HR" || requestingUser.role === "ADMIN") {
      if (notification.type !== "hr_alert") {
        res.status(403).json(new ApiResponse(403, null, "Access denied"));
        return;
      }
    } else {
      if (notification.email !== requestingUser.email) {
        res.status(403).json(new ApiResponse(403, null, "Access denied"));
        return;
      }
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          notification,
          "Notification retrieved successfully",
        ),
      );
  },
);

// Mark a notification as read
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notificationId = parseInt(req.params.id);
  const requestingUser = (req as any).user;

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    res.status(404).json(new ApiResponse(404, null, "Notification not found"));
    return;
  }

  // Check if user has permission to update this notification
  if (requestingUser.role === "HR" || requestingUser.role === "ADMIN") {
    if (notification.type !== "hr_alert") {
      res.status(403).json(new ApiResponse(403, null, "Access denied"));
      return;
    }
  } else {
    if (notification.email !== requestingUser.email) {
      res.status(403).json(new ApiResponse(403, null, "Access denied"));
      return;
    }
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { status: NotificationStatus.READ },
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedNotification, "Notification marked as read"),
    );
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const requestingUser = (req as any).user;

    let whereClause: any = { status: NotificationStatus.UNREAD };

    // Filter by role
    if (requestingUser.role === "HR" || requestingUser.role === "ADMIN") {
      whereClause.type = "hr_alert";
    } else {
      whereClause.email = requestingUser.email;
    }

    const result = await prisma.notification.updateMany({
      where: whereClause,
      data: { status: NotificationStatus.READ },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { count: result.count },
          "All notifications marked as read",
        ),
      );
  },
);

// Delete notifications
export const deleteNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const requestingUser = (req as any).user;
    const { ids } = req.body; // Array of notification IDs to delete

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid notification IDs"));
      return;
    }

    // Get notifications to verify permissions
    const notifications = await prisma.notification.findMany({
      where: { id: { in: ids } },
    });

    // Check permissions for each notification
    for (const notification of notifications) {
      if (requestingUser.role === "HR" || requestingUser.role === "ADMIN") {
        if (notification.type !== "hr_alert") {
          res
            .status(403)
            .json(
              new ApiResponse(
                403,
                null,
                "Access denied for some notifications",
              ),
            );
          return;
        }
      } else {
        if (notification.email !== requestingUser.email) {
          res
            .status(403)
            .json(
              new ApiResponse(
                403,
                null,
                "Access denied for some notifications",
              ),
            );
          return;
        }
      }
    }

    const result = await prisma.notification.deleteMany({
      where: { id: { in: ids } },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { count: result.count },
          "Notifications deleted successfully",
        ),
      );
  },
);
