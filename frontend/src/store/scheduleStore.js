import { create } from "zustand";
import { scheduleApi } from "../api/scheduleApi";

export const useScheduleStore = create((set, get) => ({
  // State
  schedules: null,
  mySchedule: null,
  availableSlots: null,
  loading: false,
  error: null,

  // Actions
  setDemoSchedule: async (applicationId, scheduleData) => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleApi.setDemoSchedule(
        applicationId,
        scheduleData
      );

      set({
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to set demo schedule",
      });
      throw error;
    }
  },

  updateDemoSchedule: async (applicationId, scheduleData) => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleApi.updateDemoSchedule(
        applicationId,
        scheduleData
      );

      set({
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to update demo schedule",
      });
      throw error;
    }
  },

  getDemoSchedule: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleApi.getDemoSchedule(applicationId);

      set({
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch demo schedule",
      });
      throw error;
    }
  },

  getMyDemoSchedule: async () => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleApi.getMyDemoSchedule();

      set({
        mySchedule: response.schedule,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        mySchedule: null,
        loading: false,
        error: null, // Don't show error if no schedule found
      });
      return null;
    }
  },

  getAllSchedules: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleApi.getAllSchedules(filters);

      set({
        schedules: response.schedules,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch schedules",
      });
      throw error;
    }
  },

  cancelDemoSchedule: async (applicationId, reason = "") => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleApi.cancelDemoSchedule(
        applicationId,
        reason
      );

      // Update schedules if they exist
      const { schedules } = get();
      if (schedules) {
        const updatedSchedules = schedules.filter(
          (schedule) => schedule.applicationId !== applicationId
        );
        set({
          schedules: updatedSchedules,
          loading: false,
          error: null,
        });
      }

      return response;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to cancel demo schedule",
      });
      throw error;
    }
  },

  getAvailableSlots: async (date) => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleApi.getAvailableSlots(date);

      set({
        availableSlots: response.slots,
        loading: false,
        error: null,
      });

      return response.slots;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to fetch available slots",
      });
      throw error;
    }
  },

  confirmAttendance: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      const response = await scheduleApi.confirmAttendance(applicationId);

      // Update my schedule if it matches
      const { mySchedule } = get();
      if (mySchedule && mySchedule.applicationId === applicationId) {
        set({
          mySchedule: { ...mySchedule, confirmed: true },
          loading: false,
          error: null,
        });
      }

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to confirm attendance",
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearSchedules: () => {
    set({
      schedules: null,
      mySchedule: null,
      availableSlots: null,
      error: null,
    });
  },
}));
