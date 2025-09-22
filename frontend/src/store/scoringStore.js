import { create } from "zustand";
import { scoringApi } from "../api/scoringApi";

export const useScoringStore = create((set, get) => ({
  // State
  scores: null,
  rubricCriteria: null,
  statistics: null,
  loading: false,
  error: null,

  // Actions
  submitScores: async (applicationId, scoreData) => {
    try {
      set({ loading: true, error: null });
      const response = await scoringApi.submitScores(applicationId, scoreData);

      set({
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to submit scores",
      });
      throw error;
    }
  },

  updateScores: async (applicationId, scoreData) => {
    try {
      set({ loading: true, error: null });
      const response = await scoringApi.updateScores(applicationId, scoreData);

      set({
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to update scores",
      });
      throw error;
    }
  },

  getScores: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      const response = await scoringApi.getScores(applicationId);

      set({
        scores: response.scores,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch scores",
      });
      throw error;
    }
  },

  getMyScores: async () => {
    try {
      set({ loading: true, error: null });
      const response = await scoringApi.getMyScores();

      set({
        scores: response.scores,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch your scores",
      });
      throw error;
    }
  },

  getAllScores: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await scoringApi.getAllScores(filters);

      set({
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch all scores",
      });
      throw error;
    }
  },

  getRubricCriteria: async () => {
    try {
      set({ loading: true, error: null });
      const response = await scoringApi.getRubricCriteria();

      set({
        rubricCriteria: response.criteria,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to fetch rubric criteria",
      });
      throw error;
    }
  },

  updateRubricCriteria: async (criteria) => {
    try {
      set({ loading: true, error: null });
      const response = await scoringApi.updateRubricCriteria(criteria);

      set({
        rubricCriteria: response.criteria,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to update rubric criteria",
      });
      throw error;
    }
  },

  calculateTotal: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      const response = await scoringApi.calculateTotal(applicationId);

      set({
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to calculate total score",
      });
      throw error;
    }
  },

  getStatistics: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await scoringApi.getStatistics(filters);

      set({
        statistics: response.statistics,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch statistics",
      });
      throw error;
    }
  },

  exportReport: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const blob = await scoringApi.exportReport(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scoring_report_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
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
        error: error.response?.data?.message || "Failed to export report",
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearScores: () => {
    set({
      scores: null,
      statistics: null,
      error: null,
    });
  },
}));
