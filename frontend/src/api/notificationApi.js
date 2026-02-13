import { fetchClient } from "../utils/fetchClient";

/**
 * Notification API
 *
 * Handles all notification-related operations including:
 * - Fetching notifications (filtered by user role)
 * - Marking notifications as read
 * - Deleting notifications
 */

const API_BASE = "/api/notifications";

export const notificationApi = {
  // Get all notifications for the current user
  getUserNotifications: async () => {
    return await fetchClient.get(API_BASE);
  },

  // Get a single notification by ID
  getNotificationById: async (notificationId) => {
    return await fetchClient.get(`${API_BASE}/${notificationId}`);
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    return await fetchClient.patch(`${API_BASE}/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return await fetchClient.patch(`${API_BASE}/mark-all-read`);
  },

  // Delete multiple notifications
  deleteNotifications: async (ids) => {
    return await fetchClient.delete(API_BASE, { data: { ids } });
  },
};
