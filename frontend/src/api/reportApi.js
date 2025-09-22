import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/reports";

export const reportApi = {
  // Generate application reports (HR only)
  generateApplicationReport: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetchClient.get(
      `${API_BASE}/applications?${queryParams}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Generate scoring reports (HR only)
  generateScoringReport: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetchClient.get(
      `${API_BASE}/scoring?${queryParams}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Generate applicant summary report (HR only)
  generateApplicantReport: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetchClient.get(
      `${API_BASE}/applicants?${queryParams}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Get report statistics (HR only)
  getReportStatistics: async (dateRange = {}) => {
    const queryParams = new URLSearchParams(dateRange).toString();
    const response = await fetchClient.get(
      `${API_BASE}/statistics?${queryParams}`
    );
    return response.data;
  },

  // Get dashboard analytics (HR only)
  getDashboardAnalytics: async () => {
    const response = await fetchClient.get(`${API_BASE}/dashboard-analytics`);
    return response.data;
  },

  // Export data to CSV (HR only)
  exportToCsv: async (dataType, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetchClient.get(
      `${API_BASE}/export/${dataType}?${queryParams}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Export data to PDF (HR only)
  exportToPdf: async (dataType, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetchClient.get(
      `${API_BASE}/export-pdf/${dataType}?${queryParams}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};
