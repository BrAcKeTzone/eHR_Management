import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/auth";

export const authApi = {
  // OTP Management
  sendOtp: async (email) => {
    const response = await fetchClient.post(`${API_BASE}/send-otp`, { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await fetchClient.post(`${API_BASE}/verify-otp`, {
      email,
      otp,
    });
    return response.data;
  },

  // Registration Process
  register: async (userData) => {
    const response = await fetchClient.post(`${API_BASE}/register`, userData);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await fetchClient.post(`${API_BASE}/login`, credentials);
    return response.data;
  },

  // Verify Login OTP
  verifyLoginOtp: async (email, otp, role) => {
    const payload = { email, otp };
    if (role) payload.role = role;
    const response = await fetchClient.post(
      `${API_BASE}/verify-login-otp`,
      payload
    );
    return response.data;
  },

  // Password Reset
  sendOtpForReset: async (email) => {
    const response = await fetchClient.post(`${API_BASE}/send-otp-reset`, {
      email,
    });
    return response.data;
  },

  verifyOtpForReset: async (email, otp) => {
    const response = await fetchClient.post(`${API_BASE}/verify-otp-reset`, {
      email,
      otp,
    });
    return response.data;
  },

  resetPassword: async (email, otp, password) => {
    const response = await fetchClient.post(`${API_BASE}/reset-password`, {
      email,
      otp,
      password,
    });
    return response.data;
  },

  // Password Change
  sendOtpForChange: async (email, password) => {
    const response = await fetchClient.post(`${API_BASE}/send-otp-change`, {
      email,
      password,
    });
    return response.data;
  },

  verifyOtpForChange: async (email, otp) => {
    const response = await fetchClient.post(`${API_BASE}/verify-otp-change`, {
      email,
      otp,
    });
    return response.data;
  },

  changePassword: async (email, oldPassword, otp, newPassword) => {
    const response = await fetchClient.post(`${API_BASE}/change-password`, {
      email,
      oldPassword,
      otp,
      newPassword,
    });
    return response.data;
  },

  // Profile Management (if endpoints exist)
  getProfile: async () => {
    const response = await fetchClient.get(`${API_BASE}/profile`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await fetchClient.put(`${API_BASE}/profile`, profileData);
    return response.data;
  },
};
