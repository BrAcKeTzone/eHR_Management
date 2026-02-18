import React, { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const { initializeAuth, isInitialized, loading } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage if available
    initializeAuth();
  }, [initializeAuth]);

  // Show loading spinner while auth is initializing
  if (!isInitialized) {
    return (
      <div className="w-full flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <AppRoutes />;
};

export default App;
