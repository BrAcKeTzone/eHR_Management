import { create } from "zustand";

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sample occupied time slots for conflict detection
const occupiedSlots = {
  "2024-03-15": ["10:00", "14:00"],
  "2024-03-20": ["14:00"],
  "2024-03-21": ["09:00", "11:00", "15:00"],
};

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
      await delay(800);

      // Simulate setting the schedule
      console.log(
        `Setting demo schedule for application ${applicationId}:`,
        scheduleData
      );

      set({
        loading: false,
        error: null,
      });

      return { success: true, schedule: scheduleData };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to set demo schedule",
      });
      throw error;
    }
  },

  updateDemoSchedule: async (applicationId, scheduleData) => {
    try {
      set({ loading: true, error: null });
      await delay(800);

      // Simulate updating the schedule
      console.log(
        `Updating demo schedule for application ${applicationId}:`,
        scheduleData
      );

      set({
        loading: false,
        error: null,
      });

      return { success: true, schedule: scheduleData };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to update demo schedule",
      });
      throw error;
    }
  },

  getDemoSchedule: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      await delay(300);

      // Find demo schedule from applications data
      // This would typically come from a separate schedules endpoint
      const sampleSchedule = {
        id: `schedule-${applicationId}`,
        applicationId,
        date: "2024-03-20",
        time: "14:00",
        location: "Room 205",
        duration: "45",
        notes: "Demo lesson preparation",
      };

      set({
        loading: false,
        error: null,
      });

      return { schedule: sampleSchedule };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch demo schedule",
      });
      throw error;
    }
  },

  getMyDemoSchedule: async () => {
    try {
      set({ loading: true, error: null });
      await delay(400);

      // Simulate getting current user's demo schedule
      const sampleMySchedule = {
        id: "schedule-current",
        applicationId: "app-1",
        date: "2024-03-20",
        time: "14:00",
        location: "Room 205",
        duration: "45",
        notes: "Prepare a lesson on quadratic equations",
        confirmed: false,
      };

      set({
        mySchedule: sampleMySchedule,
        loading: false,
        error: null,
      });

      return { schedule: sampleMySchedule };
    } catch (error) {
      set({
        mySchedule: null,
        loading: false,
        error: null,
      });
      return null;
    }
  },

  getAllSchedules: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      await delay(600);

      // Sample schedules data
      const sampleSchedules = [
        {
          id: "schedule-1",
          applicationId: "app-1",
          applicantName: "John Doe",
          program: "Secondary Education - Mathematics",
          date: "2024-03-15",
          time: "10:00",
          location: "Room 101",
          duration: "60",
          status: "completed",
        },
        {
          id: "schedule-2",
          applicationId: "app-4",
          applicantName: "Maria Santos",
          program: "Secondary Education - English",
          date: "2024-03-20",
          time: "14:00",
          location: "Room 205",
          duration: "45",
          status: "scheduled",
        },
        {
          id: "schedule-3",
          applicationId: "app-6",
          applicantName: "Ana Gutierrez",
          program: "Special Education",
          date: "2024-02-15",
          time: "09:00",
          location: "Special Education Room",
          duration: "60",
          status: "completed",
        },
      ];

      set({
        schedules: sampleSchedules,
        loading: false,
        error: null,
      });

      return { schedules: sampleSchedules };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch schedules",
      });
      throw error;
    }
  },

  cancelDemoSchedule: async (applicationId, reason = "") => {
    try {
      set({ loading: true, error: null });
      await delay(600);

      console.log(
        `Cancelling demo schedule for application ${applicationId}. Reason: ${reason}`
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

      return { success: true };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to cancel demo schedule",
      });
      throw error;
    }
  },

  getAvailableSlots: async (date) => {
    try {
      set({ loading: true, error: null });
      await delay(300);

      // Get occupied slots for the date
      const occupied = occupiedSlots[date] || [];

      // Generate all possible time slots (8 AM to 5 PM, 30-minute intervals)
      const allSlots = [];
      for (let hour = 8; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          allSlots.push(time);
        }
      }

      // Return occupied slots (slots that are NOT available)
      set({
        availableSlots: occupied,
        loading: false,
        error: null,
      });

      return occupied;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch available slots",
      });
      throw error;
    }
  },

  confirmAttendance: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      await delay(500);

      console.log(`Confirming attendance for application ${applicationId}`);

      // Update my schedule if it matches
      const { mySchedule } = get();
      if (mySchedule && mySchedule.applicationId === applicationId) {
        set({
          mySchedule: { ...mySchedule, confirmed: true },
          loading: false,
          error: null,
        });
      }

      return { success: true };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to confirm attendance",
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
