import { create } from "zustand";
import { notificationApi } from "../api/notificationApi";

export const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  selectedNotificationIds: [],

  // Actions
  fetchNotifications: async () => {
    try {
      set({ loading: true, error: null });
      const response = await notificationApi.getUserNotifications();

      set({
        notifications: response.data.data.notifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        ),
        unreadCount: response.data.data.unreadCount,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch notifications",
      });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);

      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, status: "READ" }
            : notification,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          "Failed to mark notification as read",
      });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();

      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          status: "READ",
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          "Failed to mark all notifications as read",
      });
    }
  },

  deleteNotifications: async (ids) => {
    try {
      await notificationApi.deleteNotifications(ids);

      // Update local state
      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => !ids.includes(notification.id),
        ),
        selectedNotificationIds: [],
      }));

      // Refresh to get updated unread count
      get().fetchNotifications();
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to delete notifications",
      });
    }
  },

  toggleSelectNotification: (notificationId) => {
    set((state) => {
      const isSelected = state.selectedNotificationIds.includes(notificationId);

      return {
        selectedNotificationIds: isSelected
          ? state.selectedNotificationIds.filter((id) => id !== notificationId)
          : [...state.selectedNotificationIds, notificationId],
      };
    });
  },

  selectAllNotifications: () => {
    set((state) => ({
      selectedNotificationIds: state.notifications.map((n) => n.id),
    }));
  },

  clearSelection: () => {
    set({ selectedNotificationIds: [] });
  },

  clearError: () => {
    set({ error: null });
  },
}));
