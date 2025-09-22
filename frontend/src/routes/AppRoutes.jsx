import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Auth pages
import SignupPage from "../pages/SignupPage";
import SigninPage from "../pages/SigninPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

// Applicant pages
import ApplicantDashboard from "../pages/Applicant/Dashboard";
import ApplicationForm from "../pages/Applicant/ApplicationForm";
import ApplicationHistory from "../pages/Applicant/History";

// HR pages
import HRDashboard from "../pages/HR/Dashboard";
import ApplicationReview from "../pages/HR/Review";
import Scheduling from "../pages/HR/Scheduling";
import Scoring from "../pages/HR/Scoring";
import Reports from "../pages/HR/Reports";

// Layout components
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "HR") {
      return <Navigate to="/hr/dashboard" replace />;
    } else {
      return <Navigate to="/applicant/dashboard" replace />;
    }
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "HR") {
      return <Navigate to="/hr/dashboard" replace />;
    } else {
      return <Navigate to="/applicant/dashboard" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Navigate to="/signin" replace />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SigninPage />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      {/* Applicant Routes */}
      <Route
        path="/applicant"
        element={
          <ProtectedRoute allowedRoles={["applicant"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ApplicantDashboard />} />
        <Route path="application/new" element={<ApplicationForm />} />
        <Route path="history" element={<ApplicationHistory />} />
      </Route>

      {/* HR Routes */}
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={["HR"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="review" element={<ApplicationReview />} />
        <Route path="scheduling" element={<Scheduling />} />
        <Route path="scoring" element={<Scoring />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Fallback Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navigate to="/applicant/dashboard" replace />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
