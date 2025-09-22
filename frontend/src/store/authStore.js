import { create } from "zustand";
import { persist } from "zustand/middleware";
import usersData from "../data/users.json";

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

          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Find user in dummy data
          const user = usersData.find(
            (u) =>
              u.email === credentials.email &&
              u.password === credentials.password
          );

          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
          }

          // Remove password from user object
          const { password: _, ...userWithoutPassword } = user;
          const mockToken = `mock-jwt-token-${user.id}`;

          set({
            user: userWithoutPassword,
            token: mockToken,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          // Store token in localStorage for consistency
          localStorage.setItem("authToken", mockToken);

          return { user: userWithoutPassword, token: mockToken };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Login failed",
          });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true, error: null });

          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if email already exists
          const existingUser = usersData.find(
            (u) => u.email === userData.email
          );
          if (existingUser) {
            throw new Error("Email already registered");
          }

          // Create new user (in real app, this would be sent to backend)
          const newUser = {
            id: Date.now().toString(),
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: "APPLICANT",
            isVerified: true, // Auto-verify for demo
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Add to users array (in memory only for demo)
          usersData.push({ ...newUser, password: userData.password });

          set({
            loading: false,
            error: null,
          });

          return { message: "Registration successful! Please login." };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Registration failed",
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Simulate logout API call
          await new Promise((resolve) => setTimeout(resolve, 500));
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

          const { user } = get();
          if (!user) {
            throw new Error("No user logged in");
          }

          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          set({
            loading: false,
            error: null,
          });

          return { user };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Failed to fetch profile",
          });
          throw error;
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ loading: true, error: null });

          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { user } = get();
          const updatedUser = {
            ...user,
            ...profileData,
            updatedAt: new Date().toISOString(),
          };

          set({
            user: updatedUser,
            loading: false,
            error: null,
          });

          return { user: updatedUser };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Failed to update profile",
          });
          throw error;
        }
      },

      changePassword: async (passwordData) => {
        try {
          set({ loading: true, error: null });

          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // In real app, this would validate old password and update
          set({
            loading: false,
            error: null,
          });

          return { message: "Password changed successfully" };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Failed to change password",
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

          // Simulate token verification
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Extract user ID from mock token
          const userId = token.split("-").pop();
          const user = usersData.find((u) => u.id === userId);

          if (!user) {
            throw new Error("Invalid token");
          }

          const { password: _, ...userWithoutPassword } = user;

          set({
            user: userWithoutPassword,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          return { user: userWithoutPassword };
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

      // Helper methods
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      isHROrAdmin: () => {
        const { user } = get();
        return user?.role === "HR" || user?.role === "ADMIN";
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
