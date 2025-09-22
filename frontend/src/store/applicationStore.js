import { create } from "zustand";
import { applicationApi } from "../api/applicationApi";

export const useApplicationStore = create((set, get) => ({
  // State
  applications: null,
  currentApplication: null,
  applicationHistory: null,
  loading: false,
  error: null,

  // Actions
  createApplication: async (applicationData) => {
    try {
      set({ loading: true, error: null });
      const response = await applicationApi.create(applicationData);

      set({
        currentApplication: response.application,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to create application",
      });
      throw error;
    }
  },

  getCurrentApplication: async () => {
    try {
      set({ loading: true, error: null });
      const response = await applicationApi.getCurrentApplication();

      set({
        currentApplication: response.application,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        currentApplication: null,
        loading: false,
        error: null, // Don't show error if no current application
      });
      return null;
    }
  },

  getApplicationHistory: async () => {
    try {
      set({ loading: true, error: null });
      const response = await applicationApi.getHistory();

      set({
        applicationHistory: response.applications,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch application history",
      });
      throw error;
    }
  },

  getApplicationById: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      const response = await applicationApi.getById(applicationId);

      set({
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch application",
      });
      throw error;
    }
  },

  updateApplicationStatus: async (applicationId, status, reason = "") => {
    try {
      set({ loading: true, error: null });
      const response = await applicationApi.updateStatus(
        applicationId,
        status,
        reason
      );

      // Update the applications list if it exists
      const { applications } = get();
      if (applications) {
        const updatedApplications = applications.map((app) =>
          app.id === applicationId
            ? { ...app, status, rejection_reason: reason }
            : app
        );
        set({
          applications: updatedApplications,
          loading: false,
          error: null,
        });
      }

      return response;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message ||
          "Failed to update application status",
      });
      throw error;
    }
  },

  getAllApplications: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await applicationApi.getAll(filters);

      set({
        applications: response.applications,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch applications",
      });
      throw error;
    }
  },

  getApplicationsByUserId: async (userId) => {
    try {
      set({ loading: true, error: null });
      const response = await applicationApi.getByUserId(userId);

      set({
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to fetch user applications",
      });
      throw error;
    }
  },

  downloadDocument: async (applicationId, documentName) => {
    try {
      set({ loading: true, error: null });
      const blob = await applicationApi.downloadDocument(
        applicationId,
        documentName
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to download document",
      });
      throw error;
    }
  },

  submitApplication: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      const response = await applicationApi.submit(applicationId);

      // Update current application if it matches
      const { currentApplication } = get();
      if (currentApplication && currentApplication.id === applicationId) {
        set({
          currentApplication: { ...currentApplication, status: "pending" },
          loading: false,
          error: null,
        });
      }

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to submit application",
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearApplications: () => {
    set({
      applications: null,
      currentApplication: null,
      applicationHistory: null,
      error: null,
    });
  },
}));
