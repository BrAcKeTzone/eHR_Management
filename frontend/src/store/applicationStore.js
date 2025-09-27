import { create } from "zustand";
import { applicationApi } from "../api/applicationApi";
import { delay } from "../utils/helpers";

// Hardcoded sample data as fallback
const sampleApplicationsData = [
  {
    id: "app-1",
    user_id: "user-1",
    applicant_name: "John Doe",
    applicant_email: "john.doe@example.com",
    program: "Secondary Education - Mathematics",
    subject_specialization: "Mathematics",
    status: "completed",
    created_at: "2024-01-15T08:30:00Z",
    updated_at: "2024-03-01T14:00:00Z",
    documents: [
      { name: "resume.pdf", type: "application/pdf", size: 1024000 },
      { name: "transcript.pdf", type: "application/pdf", size: 2048000 },
    ],
    education: "Bachelor of Science in Mathematics Education",
    experience: "3 years teaching experience",
    motivation: "Passionate about mathematics education",
  },
  {
    id: "app-2",
    user_id: "user-2",
    applicant_name: "Jane Smith",
    applicant_email: "jane.smith@example.com",
    program: "Elementary Education",
    subject_specialization: "English Language Arts",
    status: "pending",
    created_at: "2024-02-01T09:15:00Z",
    updated_at: "2024-02-01T09:15:00Z",
    documents: [
      { name: "resume.pdf", type: "application/pdf", size: 890000 },
      { name: "transcript.pdf", type: "application/pdf", size: 1560000 },
    ],
    education: "Bachelor of Elementary Education",
    experience: "Fresh graduate with practice teaching experience",
    motivation:
      "I believe every child deserves a strong foundation in literacy",
  },
  {
    id: "app-3",
    user_id: "user-3",
    applicant_name: "Maria Santos",
    applicant_email: "maria.santos@example.com",
    program: "Secondary Education - English",
    subject_specialization: "English Literature",
    status: "approved",
    created_at: "2024-02-10T14:20:00Z",
    updated_at: "2024-02-15T11:30:00Z",
    documents: [
      { name: "resume.pdf", type: "application/pdf", size: 967000 },
      {
        name: "teaching_portfolio.pdf",
        type: "application/pdf",
        size: 2100000,
      },
    ],
    education: "Bachelor of Arts in English Literature",
    experience: "2 years teaching experience at tutorial center",
    motivation: "Literature has the power to transform lives",
  },
];

// Try to import JSON data, fallback to sample data
let applicationsData;
try {
  applicationsData =
    require("../data/applications.json") || sampleApplicationsData;
  console.log(
    "applicationStore: JSON import success:",
    applicationsData?.length
  );
} catch (error) {
  console.error(
    "applicationStore: JSON import failed, using sample data:",
    error
  );
  applicationsData = sampleApplicationsData;
}

console.log(
  "applicationStore: applicationsData final:",
  applicationsData?.length
);

export const useApplicationStore = create((set, get) => ({
  // State
  applications: applicationsData || sampleApplicationsData, // Initialize with data
  currentApplication: null,
  applicationHistory: null,
  loading: false,
  error: null,

  // Initialize store with sample data
  initialize: () => {
    set({
      applications: applicationsData,
      error: null,
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading });
  },

  // Fetch all applications
  fetchApplications: async () => {
    try {
      console.log(
        "fetchApplications: starting, applicationsData:",
        applicationsData?.length
      );
      set({ loading: true, error: null });
      await delay(500);

      const apps = applicationsData || sampleApplicationsData;
      console.log("fetchApplications: setting applications to:", apps.length);

      set({
        applications: apps,
        loading: false,
        error: null,
      });

      return { applications: apps };
    } catch (error) {
      console.error("fetchApplications error:", error);
      set({
        loading: false,
        error: "Failed to fetch applications",
      });
      throw error;
    }
  },

  // Get applications for a specific user
  getUserApplications: (userEmail) => {
    const { applications } = get();
    return applications.filter((app) => app.applicantEmail === userEmail);
  },

  // Get current (most recent) application for a user
  getCurrentApplication: async () => {
    try {
      set({ loading: true, error: null });

      const result = await applicationApi.getCurrentApplication();

      set({
        currentApplication: result.application,
        loading: false,
        error: null,
      });

      return result;
    } catch (error) {
      set({
        currentApplication: null,
        loading: false,
        error: error.message || "Failed to fetch current application",
      });
      return { application: null };
    }
  },

  // Create new application
  createApplication: async (applicationData) => {
    try {
      set({ loading: true, error: null });

      const result = await applicationApi.create(applicationData);

      // Add to applications array
      const { applications } = get();
      const updatedApplications = [...applications, result.application];

      set({
        applications: updatedApplications,
        currentApplication: result.application,
        loading: false,
        error: null,
      });

      return result;
    } catch (error) {
      set({
        loading: false,
        error: error.message || "Failed to create application",
      });
      throw error;
    }
  },

  // Update application status
  updateApplicationStatus: async (
    applicationId,
    status,
    additionalData = {}
  ) => {
    try {
      set({ loading: true, error: null });
      await delay(800);

      const { applications } = get();
      const updatedApplications = applications.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status,
              updatedAt: new Date().toISOString(),
              ...additionalData,
            }
          : app
      );

      // Update current application if it matches
      const { currentApplication } = get();
      let updatedCurrentApp = currentApplication;
      if (currentApplication?.id === applicationId) {
        updatedCurrentApp = updatedApplications.find(
          (app) => app.id === applicationId
        );
      }

      set({
        applications: updatedApplications,
        currentApplication: updatedCurrentApp,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to update application status",
      });
      throw error;
    }
  },

  // Add demo schedule to application
  scheduleDemo: async (applicationId, demoSchedule) => {
    return get().updateApplicationStatus(applicationId, "approved", {
      demoSchedule,
    });
  },

  // Add scores to application
  addScores: async (applicationId, scores) => {
    return get().updateApplicationStatus(applicationId, "completed", {
      scores,
    });
  },

  // Get application by ID
  getApplicationById: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      await delay(300);

      const { applications } = get();
      const application = applications.find((app) => app.id === applicationId);

      set({
        loading: false,
        error: null,
      });

      return { application };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch application",
      });
      throw error;
    }
  },

  // Get application history for a user
  getApplicationHistory: async (userEmail = null) => {
    try {
      set({ loading: true, error: null });
      await delay(500);

      const targetEmail = userEmail || "john.doe@example.com";
      const { applications } = get();
      const history = applications.filter(
        (app) => app.applicantEmail === targetEmail
      );

      if (userEmail) {
        // If email provided, return directly (for HR viewing history)
        set({ loading: false, error: null });
        return { applications: history };
      } else {
        // If no email, set to state (for applicant viewing own history)
        set({
          applicationHistory: history,
          loading: false,
          error: null,
        });
        return { applications: history };
      }
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch application history",
      });
      throw error;
    }
  },

  // Get all applications with filters
  getAllApplications: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      await delay(600);

      const { applications } = get();

      // If applications are empty, initialize with sample data first
      let allApplications =
        applications.length === 0 ? applicationsData : applications;

      let filteredApplications = [...allApplications];

      // Apply filters
      if (filters.status) {
        filteredApplications = filteredApplications.filter(
          (app) => app.status.toLowerCase() === filters.status.toLowerCase()
        );
      }
      if (filters.program) {
        filteredApplications = filteredApplications.filter((app) =>
          app.program?.toLowerCase().includes(filters.program.toLowerCase())
        );
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredApplications = filteredApplications.filter(
          (app) =>
            app.firstName?.toLowerCase().includes(searchTerm) ||
            app.lastName?.toLowerCase().includes(searchTerm) ||
            app.applicant_email?.toLowerCase().includes(searchTerm) ||
            app.program?.toLowerCase().includes(searchTerm) ||
            app.position?.toLowerCase().includes(searchTerm)
        );
      }

      set({
        applications: allApplications, // Set the full dataset
        loading: false,
        error: null,
      });

      return { applications: filteredApplications };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch applications",
      });
      throw error;
    }
  },

  // Get applications by status
  getApplicationsByStatus: (status) => {
    const { applications } = get();
    return applications.filter(
      (app) => app.status.toLowerCase() === status.toLowerCase()
    );
  },

  // Get pending applications
  getPendingApplications: () => {
    return get().getApplicationsByStatus("pending");
  },

  // Get approved applications
  getApprovedApplications: () => {
    return get().getApplicationsByStatus("approved");
  },

  // Get completed applications
  getCompletedApplications: () => {
    return get().getApplicationsByStatus("completed");
  },

  // Search applications
  searchApplications: (searchTerm) => {
    const { applications } = get();
    if (!searchTerm) return applications;

    const term = searchTerm.toLowerCase();
    return applications.filter(
      (app) =>
        app.program?.toLowerCase().includes(term) ||
        app.position?.toLowerCase().includes(term) ||
        app.subjectSpecialization?.toLowerCase().includes(term) ||
        app.applicantEmail?.toLowerCase().includes(term) ||
        app.firstName?.toLowerCase().includes(term) ||
        app.lastName?.toLowerCase().includes(term)
    );
  },

  // Get application statistics
  getApplicationStats: () => {
    const { applications } = get();

    return {
      total: applications.length,
      pending: applications.filter(
        (app) => app.status.toLowerCase() === "pending"
      ).length,
      underReview: applications.filter(
        (app) => app.status.toLowerCase() === "under review"
      ).length,
      approved: applications.filter(
        (app) => app.status.toLowerCase() === "approved"
      ).length,
      completed: applications.filter(
        (app) => app.status.toLowerCase() === "completed"
      ).length,
      rejected: applications.filter(
        (app) => app.status.toLowerCase() === "rejected"
      ).length,
    };
  },

  // Get user-specific statistics
  getUserStats: (userEmail) => {
    const userApps = get().getUserApplications(userEmail);

    return {
      total: userApps.length,
      pending: userApps.filter((app) => app.status.toLowerCase() === "pending")
        .length,
      underReview: userApps.filter(
        (app) => app.status.toLowerCase() === "under review"
      ).length,
      approved: userApps.filter(
        (app) => app.status.toLowerCase() === "approved"
      ).length,
      completed: userApps.filter(
        (app) => app.status.toLowerCase() === "completed"
      ).length,
      rejected: userApps.filter(
        (app) => app.status.toLowerCase() === "rejected"
      ).length,
    };
  },

  // Delete application
  deleteApplication: async (applicationId) => {
    try {
      set({ loading: true, error: null });
      await delay(500);

      const { applications, currentApplication } = get();
      const updatedApplications = applications.filter(
        (app) => app.id !== applicationId
      );

      // Clear current application if it was the deleted one
      const updatedCurrentApp =
        currentApplication?.id === applicationId ? null : currentApplication;

      set({
        applications: updatedApplications,
        currentApplication: updatedCurrentApp,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to delete application",
      });
      throw error;
    }
  },

  // Bulk update applications
  bulkUpdateApplications: async (applicationIds, updateData) => {
    try {
      set({ loading: true, error: null });
      await delay(1000);

      const { applications } = get();
      const updatedApplications = applications.map((app) => {
        if (applicationIds.includes(app.id)) {
          return {
            ...app,
            ...updateData,
            updatedAt: new Date().toISOString(),
          };
        }
        return app;
      });

      set({
        applications: updatedApplications,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to bulk update applications",
      });
      throw error;
    }
  },

  // Download document (simulation)
  downloadDocument: async (applicationId, documentName) => {
    try {
      set({ loading: true, error: null });
      await delay(1000);

      // Simulate document download
      const dummyContent = `This is a sample document: ${documentName} for application ${applicationId}`;
      const blob = new Blob([dummyContent], { type: "application/pdf" });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      set({
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to download document",
      });
      throw error;
    }
  },

  // Submit application (change status to pending)
  submitApplication: async (applicationId) => {
    return get().updateApplicationStatus(applicationId, "pending");
  },

  // Export applications data
  exportApplications: (format = "json") => {
    const { applications } = get();

    if (format === "json") {
      return JSON.stringify(applications, null, 2);
    }

    if (format === "csv") {
      if (applications.length === 0) return "";

      const headers = Object.keys(applications[0]).join(",");
      const rows = applications.map((app) =>
        Object.values(app)
          .map((value) => (typeof value === "string" ? `"${value}"` : value))
          .join(",")
      );

      return [headers, ...rows].join("\n");
    }

    return applications;
  },

  // Clear all application data
  clearApplications: () => {
    set({
      applications: [],
      currentApplication: null,
      applicationHistory: null,
      error: null,
    });
  },

  // Reset store to initial state
  reset: () => {
    set({
      applications: [],
      currentApplication: null,
      applicationHistory: null,
      loading: false,
      error: null,
    });
  },
}));
