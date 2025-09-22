import applicationsData from "../data/applications.json";
import { useAuthStore } from "../store/authStore";

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const applicationApi = {
  // Create new application
  create: async (applicationData) => {
    await delay(1000);

    const { user } = useAuthStore.getState();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Generate new application
    const newApplication = {
      id: Date.now().toString(),
      userId: user.id,
      applicantName: `${user.firstName} ${user.lastName}`,
      applicantEmail: user.email,
      program: applicationData.program,
      teachingExperience: applicationData.teachingExperience,
      subjectSpecialization: applicationData.subjectSpecialization,
      educationalBackground: applicationData.educationalBackground,
      status: "PENDING",
      submission_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attempt_number: 1,
      documents: applicationData.documents || [],
      demo_schedule: null,
      score: null,
      result: null,
      rejection_reason: null,
    };

    // Add to applications array (in memory only for demo)
    applicationsData.push(newApplication);

    return { application: newApplication };
  },

  // Get current active application
  getCurrentApplication: async () => {
    await delay(500);

    const { user } = useAuthStore.getState();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Find the most recent application for the current user
    const userApplications = applicationsData
      .filter((app) => app.userId === user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const currentApplication =
      userApplications.find(
        (app) =>
          app.status === "PENDING" ||
          app.status === "APPROVED" ||
          app.status === "IN_REVIEW"
      ) || userApplications[0];

    return { application: currentApplication || null };
  },

  // Get application history for current user
  getHistory: async () => {
    await delay(500);

    const { user } = useAuthStore.getState();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const userApplications = applicationsData
      .filter((app) => app.userId === user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { applications: userApplications };
  },

  // Get application by ID
  getById: async (applicationId) => {
    await delay(500);

    const application = applicationsData.find(
      (app) => app.id === applicationId
    );
    if (!application) {
      throw new Error("Application not found");
    }

    return { application };
  },

  // Update application status (HR only)
  updateStatus: async (applicationId, status, reason = "") => {
    await delay(500);

    const { user } = useAuthStore.getState();
    if (!user || user.role !== "HR") {
      throw new Error("Unauthorized: HR access required");
    }

    const applicationIndex = applicationsData.findIndex(
      (app) => app.id === applicationId
    );
    if (applicationIndex === -1) {
      throw new Error("Application not found");
    }

    applicationsData[applicationIndex] = {
      ...applicationsData[applicationIndex],
      status,
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    };

    return { application: applicationsData[applicationIndex] };
  },

  // Get all applications (HR only) with filters
  getAll: async (filters = {}) => {
    await delay(500);

    const { user } = useAuthStore.getState();
    if (!user || user.role !== "HR") {
      throw new Error("Unauthorized: HR access required");
    }

    let filteredApplications = [...applicationsData];

    // Apply filters
    if (filters.status) {
      filteredApplications = filteredApplications.filter(
        (app) => app.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.program) {
      filteredApplications = filteredApplications.filter((app) =>
        app.program.toLowerCase().includes(filters.program.toLowerCase())
      );
    }

    // Sort by most recent
    filteredApplications.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return { applications: filteredApplications };
  },

  // Get applications for specific user (HR only)
  getByUserId: async (userId) => {
    await delay(500);

    const { user } = useAuthStore.getState();
    if (!user || user.role !== "HR") {
      throw new Error("Unauthorized: HR access required");
    }

    const userApplications = applicationsData
      .filter((app) => app.userId === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { applications: userApplications };
  },

  // Download application document (simulated)
  downloadDocument: async (applicationId, documentName) => {
    await delay(500);

    // Simulate document download
    const dummyContent = `This is a dummy document: ${documentName} for application ${applicationId}`;
    const blob = new Blob([dummyContent], { type: "text/plain" });

    return blob;
  },

  // Submit for review (change status from draft to pending)
  submit: async (applicationId) => {
    await delay(500);

    const { user } = useAuthStore.getState();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const applicationIndex = applicationsData.findIndex(
      (app) => app.id === applicationId && app.userId === user.id
    );

    if (applicationIndex === -1) {
      throw new Error("Application not found or access denied");
    }

    applicationsData[applicationIndex] = {
      ...applicationsData[applicationIndex],
      status: "PENDING",
      submission_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { application: applicationsData[applicationIndex] };
  },
};
