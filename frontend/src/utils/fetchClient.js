import axios from "axios";

// Create axios instance with default configuration
const fetchClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
fetchClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If the data is FormData, delete Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle common responses
fetchClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized - but not for login/auth endpoints
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes("/auth/");

      // Only redirect on 401 for non-auth endpoints (protected routes)
      if (!isAuthEndpoint) {
        // Clear the token from localStorage
        localStorage.removeItem("authToken");

        // Try to update auth store to unauthenticated state
        try {
          // Use dynamic import to avoid circular dependency issues
          const { useAuthStore } = await import("../store/authStore");
          const store = useAuthStore.getState();
          // Call logout if available
          if (store.logout) {
            await store.logout();
          }
        } catch (e) {
          // Fallback if store is not available - just clear the token
          console.error("Failed to clear auth store", e);
        }

        // Prevent redirect loop by checking current location and avoiding auth pages
        const currentPath = window.location.pathname;
        const isPublicAuthPage =
          /^\/(signin|signup|forgot-password)($|\/)/.test(currentPath);

        // Only use hard redirect if not already on a public page
        if (!isPublicAuthPage) {
          // Use a small delay to prevent race conditions with React routing
          setTimeout(() => {
            window.location.href = "/signin";
          }, 100);
        }
      }
      // For auth endpoints (like login), let the error bubble up to be handled by the form
    }

    // Handle network errors
    if (!error.response) {
      error.response = {
        data: {
          message: "Network error. Please check your connection.",
        },
      };
    }

    return Promise.reject(error);
  },
);

export { fetchClient };
