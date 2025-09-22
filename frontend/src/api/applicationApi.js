import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/applications";

export const applicationApi = {
  // Create new application
  create: async (applicationData) => {
    const formData = new FormData();

    // Append non-file fields
    Object.keys(applicationData).forEach((key) => {
      if (
        key !== "documents" &&
        applicationData[key] !== null &&
        applicationData[key] !== undefined
      ) {
        formData.append(key, applicationData[key]);
      }
    });

    // Append files
    if (applicationData.documents && applicationData.documents.length > 0) {
      applicationData.documents.forEach((file, index) => {
        formData.append(`documents`, file);
      });
    }

    const response = await fetchClient.post(`${API_BASE}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get current active application
  getCurrentApplication: async () => {
    const response = await fetchClient.get(`${API_BASE}/current`);
    return response.data;
  },

  // Get application history for current user
  getHistory: async () => {
    const response = await fetchClient.get(`${API_BASE}/history`);
    return response.data;
  },

  // Get application by ID
  getById: async (applicationId) => {
    const response = await fetchClient.get(`${API_BASE}/${applicationId}`);
    return response.data;
  },

  // Update application status (HR only)
  updateStatus: async (applicationId, status, reason = "") => {
    const response = await fetchClient.put(
      `${API_BASE}/${applicationId}/status`,
      {
        status,
        reason,
      }
    );
    return response.data;
  },

  // Get all applications (HR only) with filters
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetchClient.get(`${API_BASE}?${queryParams}`);
    return response.data;
  },

  // Get applications for specific user (HR only)
  getByUserId: async (userId) => {
    const response = await fetchClient.get(`${API_BASE}/user/${userId}`);
    return response.data;
  },

  // Download application document
  downloadDocument: async (applicationId, documentName) => {
    const response = await fetchClient.get(
      `${API_BASE}/${applicationId}/documents/${documentName}`,
      { responseType: "blob" }
    );
    return response.data;
  },

  // Submit for review (change status from draft to pending)
  submit: async (applicationId) => {
    const response = await fetchClient.put(
      `${API_BASE}/${applicationId}/submit`
    );
    return response.data;
  },
};
