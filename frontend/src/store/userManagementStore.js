import { create } from "zustand";
import { persist } from "zustand/middleware";
import usersData from "../data/users.json";

// Create a working copy of the users data that can be modified
// This will be synchronized with the auth store
let workingUsersData = [...usersData];

// Simulate API delay
const apiDelay = () =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));

export const useUserManagementStore = create(
  persist(
    (set, get) => ({
      users: workingUsersData,
      loading: false,
      error: null,

      // Get all users
      getAllUsers: async () => {
        set({ loading: true, error: null });
        try {
          await apiDelay();
          // Use the current working data
          set({ users: workingUsersData, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Add a new user
      addUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          await apiDelay();

          const users = get().users;

          // Check if email already exists
          const existingUser = users.find(
            (user) => user.email === userData.email
          );
          if (existingUser) {
            throw new Error("A user with this email already exists");
          }

          // Generate new user ID
          const newId = (
            Math.max(...users.map((u) => parseInt(u.id))) + 1
          ).toString();

          const newUser = {
            id: newId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
            phoneNumber: userData.phoneNumber || "",
            address: userData.address || "",
            emailVerified: userData.role === "HR" ? true : false, // Auto-verify HR accounts
            isVerified: userData.role === "HR" ? true : false,
            password: userData.password,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            passwordChangedAt: new Date().toISOString(),
            lastLoginAt: null,
          };

          const updatedUsers = [...users, newUser];
          set({ users: updatedUsers, loading: false });

          // Sync with the working data and auth store
          workingUsersData.push(newUser);
          usersData.push(newUser);

          return newUser;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Update user
      updateUser: async (userId, userData) => {
        set({ loading: true, error: null });
        try {
          await apiDelay();

          const users = get().users;
          const userIndex = users.findIndex((user) => user.id === userId);

          if (userIndex === -1) {
            throw new Error("User not found");
          }

          // Check if email already exists for other users
          if (userData.email) {
            const existingUser = users.find(
              (user) => user.email === userData.email && user.id !== userId
            );
            if (existingUser) {
              throw new Error("A user with this email already exists");
            }
          }

          const updatedUser = {
            ...users[userIndex],
            ...userData,
            updatedAt: new Date().toISOString(),
          };

          const updatedUsers = [...users];
          updatedUsers[userIndex] = updatedUser;

          set({ users: updatedUsers, loading: false });

          // Sync with working data and auth store
          const workingIndex = workingUsersData.findIndex(
            (user) => user.id === userId
          );
          if (workingIndex !== -1) {
            workingUsersData[workingIndex] = updatedUser;
          }

          const authIndex = usersData.findIndex((user) => user.id === userId);
          if (authIndex !== -1) {
            usersData[authIndex] = updatedUser;
          }

          return updatedUser;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Delete user
      deleteUser: async (userId) => {
        set({ loading: true, error: null });
        try {
          await apiDelay();

          const users = get().users;
          const userToDelete = users.find((user) => user.id === userId);

          if (!userToDelete) {
            throw new Error("User not found");
          }

          // Prevent deletion of HR users
          if (userToDelete.role === "HR") {
            throw new Error("Cannot delete HR users");
          }

          const updatedUsers = users.filter((user) => user.id !== userId);
          set({ users: updatedUsers, loading: false });

          // Sync with working data and auth store
          const workingIndex = workingUsersData.findIndex(
            (user) => user.id === userId
          );
          if (workingIndex !== -1) {
            workingUsersData.splice(workingIndex, 1);
          }

          const authIndex = usersData.findIndex((user) => user.id === userId);
          if (authIndex !== -1) {
            usersData.splice(authIndex, 1);
          }

          return true;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Get user by ID
      getUserById: async (userId) => {
        set({ loading: true, error: null });
        try {
          await apiDelay();

          const users = get().users;
          const user = users.find((user) => user.id === userId);

          if (!user) {
            throw new Error("User not found");
          }

          set({ loading: false });
          return user;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Get user statistics
      getUserStats: () => {
        const users = get().users;
        return {
          total: users.length,
          hr: users.filter((user) => user.role === "HR").length,
          applicants: users.filter((user) => user.role === "APPLICANT").length,
        };
      },

      // Clear errors
      clearError: () => set({ error: null }),

      // Reset store
      resetStore: () => {
        workingUsersData = [...usersData];
        set({
          users: workingUsersData,
          loading: false,
          error: null,
        });
      },

      // Sync with external changes (when auth store modifies users)
      syncUsers: () => {
        workingUsersData = [...usersData];
        set({ users: workingUsersData });
      },
    }),
    {
      name: "userManagement-storage",
      partialize: (state) => ({ users: state.users }),
    }
  )
);
