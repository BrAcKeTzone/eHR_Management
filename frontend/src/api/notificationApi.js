import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/notifications";

export const notificationApi = {
  // Get user notifications
  getUserNotifications: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetchClient.get(`${API_BASE}?${queryParams}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await fetchClient.put(
      `${API_BASE}/${notificationId}/read`
    );
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await fetchClient.put(`${API_BASE}/mark-all-read`);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await fetchClient.delete(`${API_BASE}/${notificationId}`);
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await fetchClient.get(`${API_BASE}/unread-count`);
    return response.data;
  },

  // Send notification (HR only)
  sendNotification: async (notificationData) => {
    const response = await fetchClient.post(
      `${API_BASE}/send`,
      notificationData
    );
    return response.data;
  },

  // Get notification templates (HR only)
  getTemplates: async () => {
    const response = await fetchClient.get(`${API_BASE}/templates`);
    return response.data;
  },

  // Update notification template (Admin only)
  updateTemplate: async (templateId, templateData) => {
    const response = await fetchClient.put(
      `${API_BASE}/templates/${templateId}`,
      templateData
    );
    return response.data;
  },
};
