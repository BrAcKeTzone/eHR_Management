import { create } from "zustand";
import { reportApi } from "../api/reportApi";

export const useReportStore = create((set, get) => ({
  // State
  reportStatistics: null,
  dashboardAnalytics: null,
  loading: false,
  error: null,

  // Actions
  generateApplicationReport: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const blob = await reportApi.generateApplicationReport(filters);

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message ||
          "Failed to generate application report",
      });
      throw error;
    }
  },

  generateScoringReport: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const blob = await reportApi.generateScoringReport(filters);

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to generate scoring report",
      });
      throw error;
    }
  },

  generateApplicantReport: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const blob = await reportApi.generateApplicantReport(filters);

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message ||
          "Failed to generate applicant report",
      });
      throw error;
    }
  },

  getReportStatistics: async (dateRange = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await reportApi.getReportStatistics(dateRange);

      set({
        reportStatistics: response.statistics,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to fetch report statistics",
      });
      throw error;
    }
  },

  getDashboardAnalytics: async () => {
    try {
      set({ loading: true, error: null });
      const response = await reportApi.getDashboardAnalytics();

      set({
        dashboardAnalytics: response.analytics,
        loading: false,
        error: null,
      });

      return response.analytics;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch dashboard analytics",
      });
      throw error;
    }
  },

  exportToCsv: async (dataType, filters = {}) => {
    try {
      set({ loading: true, error: null });
      const blob = await reportApi.exportToCsv(dataType, filters);

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to export to CSV",
      });
      throw error;
    }
  },

  exportToPdf: async (dataType, filters = {}) => {
    try {
      set({ loading: true, error: null });
      const blob = await reportApi.exportToPdf(dataType, filters);

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to export to PDF",
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearReports: () => {
    set({
      reportStatistics: null,
      dashboardAnalytics: null,
      error: null,
    });
  },
}));
