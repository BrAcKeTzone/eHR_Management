import { fetchClient } from "../utils/fetchClient";

/**
 * IMPORTANT: The backend does NOT have /api/reports endpoints.
 * Reports and statistics should be generated client-side from data retrieved via:
 * - applicationApi.getAll() - for application reports
 * - scoringApi endpoints - for scoring reports
 * - userApi.getUserStats() - for user statistics
 *
 * This file is kept as placeholders. Implement client-side report generation
 * using the data from the above APIs.
 */

const API_BASE_APPLICATIONS = "/api/applications";
const API_BASE_USERS = "/api/users";

export const reportApi = {
  // Get application data for client-side report generation
  getApplicationsData: async (filters = {}) => {
    const response = await fetchClient.get(API_BASE_APPLICATIONS, {
      params: filters,
    });
    return response.data;
  },

  // Get user statistics (HR only)
  getUserStatistics: async () => {
    const response = await fetchClient.get(`${API_BASE_USERS}/stats`);
    return response.data;
  },

  // Get scoring data for reports - use scoringApi instead
  getScoringData: async (applicationId) => {
    console.warn(
      "Use scoringApi.getApplicationScoresSummary() for scoring data"
    );
    return { data: null };
  },

  // Placeholder: Generate reports client-side
  generateApplicationReport: async (filters = {}) => {
    console.warn(
      "Backend has no report generation. Fetch data via applicationApi and generate reports client-side."
    );
    return null;
  },

  // Placeholder: Generate reports client-side
  generateScoringReport: async (filters = {}) => {
    console.warn(
      "Backend has no report generation. Fetch data via scoringApi and generate reports client-side."
    );
    return null;
  },

  // Placeholder: Generate reports client-side
  generateApplicantReport: async (filters = {}) => {
    console.warn(
      "Backend has no report generation. Fetch data via userApi and generate reports client-side."
    );
    return null;
  },

  // Placeholder
  getReportStatistics: async (dateRange = {}) => {
    console.warn(
      "Backend has no report statistics. Use userApi.getUserStats() instead."
    );
    return { data: null };
  },

  // Placeholder
  getDashboardAnalytics: async () => {
    console.warn(
      "Backend has no analytics endpoint. Combine data from userApi.getUserStats() and applicationApi.getAll()."
    );
    return { data: null };
  },

  // Placeholder
  exportToCsv: async (dataType, filters = {}) => {
    console.warn(
      "Backend has no CSV export. Implement client-side CSV generation."
    );
    return null;
  },

  // Placeholder
  exportToPdf: async (dataType, filters = {}) => {
    console.warn(
      "Backend has no PDF export. Implement client-side PDF generation."
    );
    return null;
  },
};
