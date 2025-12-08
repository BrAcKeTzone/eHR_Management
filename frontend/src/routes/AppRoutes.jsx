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
import ApplicationsManagement from "../pages/HR/ApplicationsManagement";
import Scheduling from "../pages/HR/Scheduling";
import Scoring from "../pages/HR/Scoring";
import InterviewScheduling from "../pages/HR/InterviewScheduling";
import InterviewRating from "../pages/HR/InterviewRating";
import Reports from "../pages/HR/Reports";
import UserManagement from "../pages/HR/UserManagement";

// Shared pages
import ProfilePage from "../pages/ProfilePage";

// Layout components
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// Dashboard Redirect Component
const DashboardRedirect = () => {
  const { user } = useAuthStore();

  if (user?.role === "HR") {
    return <Navigate to="/hr/dashboard" replace />;
  } else {
    return <Navigate to="/applicant/dashboard" replace />;
  }
};

// Profile Redirect Component
const ProfileRedirect = () => {
  const { user } = useAuthStore();

  if (user?.role === "HR") {
    return <Navigate to="/hr/profile" replace />;
  } else {
    return <Navigate to="/applicant/profile" replace />;
  }
};

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
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Routes>
      {/* Root Route - Redirect to signin for unauthenticated, Dashboard for authenticated */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === "HR" ? (
              <Navigate to="/hr/dashboard" replace />
            ) : (
              <Navigate to="/applicant/dashboard" replace />
            )
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* Public Routes */}
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
          <ProtectedRoute allowedRoles={["APPLICANT"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ApplicantDashboard />} />
        <Route path="application" element={<ApplicationForm />} />
        <Route path="history" element={<ApplicationHistory />} />
        <Route path="profile" element={<ProfilePage />} />
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
        <Route path="applications" element={<ApplicationsManagement />} />
        <Route path="scheduling" element={<Scheduling />} />
        <Route path="scoring" element={<Scoring />} />
        <Route path="interview-scheduling" element={<InterviewScheduling />} />
        <Route path="interview-rating" element={<InterviewRating />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Shared Profile Route for direct access - redirect to role-specific profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileRedirect />
          </ProtectedRoute>
        }
      />

      {/* Fallback Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
