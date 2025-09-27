import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/users";

export const userApi = {
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
};

export default userApi;
