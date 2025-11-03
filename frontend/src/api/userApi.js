import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/users";

export const userApi = {
  // Get current user profile
  getCurrentUser: async () => {
    const response = await fetchClient.get(`${API_BASE}/me`);
    return response.data;
  },

  // Update current user profile
  updateCurrentUser: async (userData) => {
    const response = await fetchClient.put(`${API_BASE}/me`, userData);
    return response.data;
  },

  // Get all users with pagination and filtering
  getAllUsers: async (options = {}) => {
    const params = new URLSearchParams();

    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.role) params.append("role", options.role);
    if (options.search) params.append("search", options.search);
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.sortOrder) params.append("sortOrder", options.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

    const response = await fetchClient.get(url);
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await fetchClient.get(`${API_BASE}/stats`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await fetchClient.get(`${API_BASE}/${userId}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await fetchClient.post(API_BASE, userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await fetchClient.put(`${API_BASE}/${userId}`, userData);
    return response.data;
  },

  // Update user password
  updateUserPassword: async (userId, passwordData) => {
    const response = await fetchClient.put(
      `${API_BASE}/${userId}/password`,
      passwordData
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await fetchClient.delete(`${API_BASE}/${userId}`);
    return response.data;
  },

  // Send OTP for HR deletion
  sendOtpForHrDeletion: async () => {
    const response = await fetchClient.post(
      `${API_BASE}/hr-deletion/send-otp`,
      {}
    );
    return response.data;
  },

  // Verify OTP and delete HR user
  verifyOtpAndDeleteHr: async (userId, otp) => {
    const response = await fetchClient.post(
      `${API_BASE}/${userId}/verify-and-delete-hr`,
      { otp }
    );
    return response.data;
  },

  // Check if email exists
  checkEmailExists: async (email) => {
    const response = await fetchClient.get(
      `${API_BASE}/check-email?email=${encodeURIComponent(email)}`
    );
    return response.data;
  },
};

export default userApi;
