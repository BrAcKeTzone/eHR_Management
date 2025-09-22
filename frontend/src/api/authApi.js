import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/auth";

export const authApi = {
  // Login user
  login: async (credentials) => {
    const response = await fetchClient.post(`${API_BASE}/login`, credentials);
    return response.data;
  },

  // Register new applicant
  register: async (userData) => {
    const response = await fetchClient.post(`${API_BASE}/register`, userData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await fetchClient.post(`${API_BASE}/logout`);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await fetchClient.get(`${API_BASE}/profile`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetchClient.put(`${API_BASE}/profile`, profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await fetchClient.put(
      `${API_BASE}/change-password`,
      passwordData
    );
    return response.data;
  },

  // Verify JWT token
  verifyToken: async () => {
    const response = await fetchClient.get(`${API_BASE}/verify-token`);
    return response.data;
  },
};
