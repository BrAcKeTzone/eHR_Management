import { fetchClient } from "../utils/fetchClient";

const API_BASE_URL = "/api/pre-employment";

export const preEmploymentApi = {
  // Get existing requirements
  get: async () => {
    try {
      const response = await fetchClient.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching pre-employment requirements:", error);
      throw error;
    }
  },

  // Get requirements for a specific user (HR only)
  getByUserId: async (userId) => {
    try {
      const response = await fetchClient.get(`${API_BASE_URL}/${userId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching pre-employment requirements for user:",
        error,
      );
      throw error;
    }
  },

  // Save requirements (upsert)
  save: async (identifiers, files, tesdaFiles) => {
    try {
      const formData = new FormData();

      // Append text fields
      Object.keys(identifiers).forEach((key) => {
        if (identifiers[key] !== null && identifiers[key] !== undefined) {
          formData.append(key, identifiers[key]);
        }
      });

      // Append single files
      Object.keys(files).forEach((key) => {
        if (files[key]) {
          formData.append(key, files[key]);
        }
      });

      // Append multiple files (TESDA)
      if (tesdaFiles && tesdaFiles.length > 0) {
        tesdaFiles.forEach((file) => {
          formData.append("tesdaFiles", file);
        });
      }

      const response = await fetchClient.post(API_BASE_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // Increase timeout to 5 minutes for large file uploads
      });
      return response.data;
    } catch (error) {
      console.error("Error saving pre-employment requirements:", error);
      throw error;
    }
  },

  // Delete all requirements
  clear: async () => {
    try {
      const response = await fetchClient.delete(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error clearing pre-employment requirements:", error);
      throw error;
    }
  },
};
