import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/scoring";

export const scoringApi = {
  // Submit rubric scores for application (HR only)
  submitScores: async (applicationId, scores) => {
    const response = await fetchClient.post(
      `${API_BASE}/${applicationId}`,
      scores
    );
    return response.data;
  },

  // Update existing scores (HR only)
  updateScores: async (applicationId, scores) => {
    const response = await fetchClient.put(
      `${API_BASE}/${applicationId}`,
      scores
    );
    return response.data;
  },

  // Get scores for specific application
  getScores: async (applicationId) => {
    const response = await fetchClient.get(`${API_BASE}/${applicationId}`);
    return response.data;
  },

  // Get current user's scores (applicant)
  getMyScores: async () => {
    const response = await fetchClient.get(`${API_BASE}/my-scores`);
    return response.data;
  },

  // Get all scored applications (HR only)
  getAllScores: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetchClient.get(`${API_BASE}?${queryParams}`);
    return response.data;
  },

  // Get rubric criteria and weights
  getRubricCriteria: async () => {
    const response = await fetchClient.get(`${API_BASE}/rubric-criteria`);
    return response.data;
  },

  // Update rubric criteria (Admin only)
  updateRubricCriteria: async (criteria) => {
    const response = await fetchClient.put(
      `${API_BASE}/rubric-criteria`,
      criteria
    );
    return response.data;
  },

  // Calculate total score for application
  calculateTotal: async (applicationId) => {
    const response = await fetchClient.get(
      `${API_BASE}/${applicationId}/calculate-total`
    );
    return response.data;
  },

  // Get scoring statistics (HR only)
  getStatistics: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetchClient.get(
      `${API_BASE}/statistics?${queryParams}`
    );
    return response.data;
  },

  // Export scores report (HR only)
  exportReport: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetchClient.get(
      `${API_BASE}/export?${queryParams}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};
