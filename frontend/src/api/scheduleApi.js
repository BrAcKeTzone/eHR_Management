import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/schedule";

export const scheduleApi = {
  // Create/Set demo schedule for application (HR only)
  setDemoSchedule: async (applicationId, scheduleData) => {
    const response = await fetchClient.post(
      `${API_BASE}/${applicationId}`,
      scheduleData
    );
    return response.data;
  },

  // Update demo schedule (HR only)
  updateDemoSchedule: async (applicationId, scheduleData) => {
    const response = await fetchClient.put(
      `${API_BASE}/${applicationId}`,
      scheduleData
    );
    return response.data;
  },

  // Get demo schedule for application
  getDemoSchedule: async (applicationId) => {
    const response = await fetchClient.get(`${API_BASE}/${applicationId}`);
    return response.data;
  },

  // Get current user's demo schedule (applicant)
  getMyDemoSchedule: async () => {
    const response = await fetchClient.get(`${API_BASE}/my-schedule`);
    return response.data;
  },

  // Get all scheduled demos (HR only)
  getAllSchedules: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetchClient.get(`${API_BASE}?${queryParams}`);
    return response.data;
  },

  // Cancel demo schedule (HR only)
  cancelDemoSchedule: async (applicationId, reason = "") => {
    const response = await fetchClient.delete(`${API_BASE}/${applicationId}`, {
      data: { reason },
    });
    return response.data;
  },

  // Get available time slots (HR only)
  getAvailableSlots: async (date) => {
    const response = await fetchClient.get(
      `${API_BASE}/available-slots?date=${date}`
    );
    return response.data;
  },

  // Confirm demo attendance (applicant)
  confirmAttendance: async (applicationId) => {
    const response = await fetchClient.put(
      `${API_BASE}/${applicationId}/confirm`
    );
    return response.data;
  },
};
