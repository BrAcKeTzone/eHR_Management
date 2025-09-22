import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/authApi";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          const response = await authApi.login(credentials);

          const { user, token } = response;

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          // Store token in localStorage for API requests
          localStorage.setItem("authToken", token);

          return response;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || "Login failed",
          });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true, error: null });
          const response = await authApi.register(userData);

          set({
            loading: false,
            error: null,
          });

          return response;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || "Registration failed",
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
          localStorage.removeItem("authToken");
        }
      },

      getProfile: async () => {
        try {
          set({ loading: true, error: null });
          const response = await authApi.getProfile();

          set({
            user: response.user,
            loading: false,
            error: null,
          });

          return response;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to fetch profile",
          });
          throw error;
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ loading: true, error: null });
          const response = await authApi.updateProfile(profileData);

          set({
            user: response.user,
            loading: false,
            error: null,
          });

          return response;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to update profile",
          });
          throw error;
        }
      },

      changePassword: async (passwordData) => {
        try {
          set({ loading: true, error: null });
          const response = await authApi.changePassword(passwordData);

          set({
            loading: false,
            error: null,
          });

          return response;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to change password",
          });
          throw error;
        }
      },

      verifyToken: async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) {
            throw new Error("No token found");
          }

          set({ loading: true, error: null });
          const response = await authApi.verifyToken();

          set({
            user: response.user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          return response;
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
          localStorage.removeItem("authToken");
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Initialize auth state from localStorage
      initializeAuth: () => {
        const token = localStorage.getItem("authToken");
        if (token) {
          set({ token });
          get()
            .verifyToken()
            .catch(() => {
              // Token is invalid, clear it
              localStorage.removeItem("authToken");
            });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
