import { create } from "zustand";

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const useReportStore = create((set, get) => ({
  // State
  reportStatistics: null,
  dashboardAnalytics: null,
  loading: false,
  error: null,

  // Actions
  generateApplicationReport: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      await delay(2000);

      // Generate sample PDF report content
      const reportContent = `BLANCIA COLLEGE FOUNDATION INC.
APPLICATIONS REPORT
Generated on: ${new Date().toLocaleDateString()}

SUMMARY
========
Total Applications: 6
Pending Review: 1
Approved: 2
Rejected: 1
Completed: 2

APPLICATIONS DETAILS
===================
1. John Doe (Attempt #2) - Secondary Education - Mathematics
   Status: Completed | Result: PASS | Score: 85%
   
2. Jane Smith (Attempt #1) - Elementary Education
   Status: Pending Review
   
3. John Doe (Attempt #1) - Secondary Education - Science
   Status: Rejected | Reason: Insufficient experience
   
4. Maria Santos (Attempt #1) - Secondary Education - English  
   Status: Approved | Demo Scheduled: March 20, 2024
   
5. Carlos Rivera (Attempt #1) - Physical Education
   Status: Approved
   
6. Ana Gutierrez (Attempt #1) - Special Education
   Status: Completed | Result: PASS | Score: 92%

STATISTICS
==========
Pass Rate: 100% (2/2 completed applications)
Average Score: 88.5%
Most Popular Program: Secondary Education (50%)
Average Processing Time: 28 days`;

      const blob = new Blob([reportContent], { type: "application/pdf" });

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to generate application report",
      });
      throw error;
    }
  },

  generateScoringReport: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      await delay(1800);

      const reportContent = `BLANCIA COLLEGE FOUNDATION INC.
SCORING REPORT
Generated on: ${new Date().toLocaleDateString()}

OVERALL STATISTICS
==================
Total Demos Scored: 2
Average Score: 88.5%
Pass Rate: 100%
Passing Threshold: 75%

DETAILED SCORES
===============
1. John Doe - Secondary Education Mathematics
   Communication: 88/100
   Knowledge: 92/100  
   Teaching Skills: 85/100
   Professionalism: 80/100
   TOTAL: 85% - PASS
   
2. Ana Gutierrez - Special Education
   Communication: 95/100
   Knowledge: 98/100
   Teaching Skills: 90/100
   Professionalism: 88/100
   TOTAL: 92% - PASS

CRITERIA ANALYSIS
=================
Communication Average: 91.5%
Knowledge Average: 95%
Teaching Skills Average: 87.5%
Professionalism Average: 84%

RECOMMENDATIONS
===============
- Continue current evaluation standards
- Consider additional training for professionalism
- Strong performance across all criteria`;

      const blob = new Blob([reportContent], { type: "application/pdf" });

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to generate scoring report",
      });
      throw error;
    }
  },

  generateApplicantReport: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      await delay(1500);

      const reportContent = `BLANCIA COLLEGE FOUNDATION INC.
APPLICANT REPORT
Generated on: ${new Date().toLocaleDateString()}

APPLICANT SUMMARY
=================
Total Unique Applicants: 5
Returning Applicants: 1 (John Doe - 2 attempts)
New Applicants: 4

DEMOGRAPHIC BREAKDOWN
=====================
Programs Applied For:
- Secondary Education: 3 (60%)
- Elementary Education: 1 (20%)
- Physical Education: 1 (20%)
- Special Education: 1 (20%)

Geographic Distribution:
- Quezon City: 1
- Makati City: 1
- Pasig City: 1
- Taguig City: 1
- Las Piñas City: 1

APPLICANT PROFILES
==================
1. John Doe (john.doe@example.com)
   - 2 Applications (Mathematics, Science)
   - Latest: Completed with PASS
   
2. Jane Smith (jane.smith@example.com)
   - 1 Application (Elementary Education)
   - Status: Under Review
   
3. Maria Santos (maria.santos@example.com)
   - 1 Application (English Literature)
   - Status: Approved for Demo
   
4. Carlos Rivera (carlos.rivera@example.com)
   - 1 Application (Physical Education)
   - Status: Approved
   
5. Ana Gutierrez (ana.gutierrez@example.com)
   - 1 Application (Special Education)
   - Latest: Completed with PASS`;

      const blob = new Blob([reportContent], { type: "application/pdf" });

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to generate applicant report",
      });
      throw error;
    }
  },

  getReportStatistics: async (dateRange = {}) => {
    try {
      set({ loading: true, error: null });
      await delay(500);

      const statistics = {
        totalApplications: 6,
        thisMonth: 3,
        lastMonth: 2,
        growth: 50, // percentage
        statusBreakdown: {
          pending: 1,
          approved: 2,
          rejected: 1,
          completed: 2,
        },
        programBreakdown: {
          "Secondary Education": 3,
          "Elementary Education": 1,
          "Physical Education": 1,
          "Special Education": 1,
        },
        averageProcessingTime: 28, // days
        passRate: 100, // percentage
      };

      set({
        reportStatistics: statistics,
        loading: false,
        error: null,
      });

      return { statistics };
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch report statistics",
      });
      throw error;
    }
  },

  getDashboardAnalytics: async () => {
    try {
      set({ loading: true, error: null });
      await delay(400);

      const analytics = {
        thisMonth: 3,
        lastMonth: 2,
        avgProcessingTime: 28,
        totalApplications: 6,
        pendingReview: 1,
        approvedApps: 2,
        completedApps: 2,
        passRate: 100,
        topPrograms: [
          { name: "Secondary Education", count: 3 },
          { name: "Elementary Education", count: 1 },
          { name: "Physical Education", count: 1 },
        ],
        monthlyTrend: [
          { month: "Jan", applications: 2 },
          { month: "Feb", applications: 3 },
          { month: "Mar", applications: 1 },
        ],
      };

      set({
        dashboardAnalytics: analytics,
        loading: false,
        error: null,
      });

      return analytics;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to fetch dashboard analytics",
      });
      throw error;
    }
  },

  exportToCsv: async (dataType, filters = {}) => {
    try {
      set({ loading: true, error: null });
      await delay(1200);

      let csvContent = "";

      switch (dataType) {
        case "applications":
          csvContent = `ID,Applicant Name,Email,Program,Status,Result,Score,Date Created,Attempt
app-1,John Doe,john.doe@example.com,Secondary Education - Mathematics,completed,pass,85,2024-01-15,2
app-2,Jane Smith,jane.smith@example.com,Elementary Education,pending,,,2024-02-01,1
app-3,John Doe,john.doe@example.com,Secondary Education - Science,rejected,fail,,2023-11-01,1
app-4,Maria Santos,maria.santos@example.com,Secondary Education - English,approved,,,2024-02-10,1
app-5,Carlos Rivera,carlos.rivera@example.com,Physical Education,approved,,,2024-02-20,1
app-6,Ana Gutierrez,ana.gutierrez@example.com,Special Education,completed,pass,92,2024-01-05,1`;
          break;
        case "scoring":
          csvContent = `Application ID,Applicant Name,Program,Communication,Knowledge,Teaching Skills,Professionalism,Total Score,Result
app-1,John Doe,Secondary Education - Mathematics,88,92,85,80,85,pass
app-6,Ana Gutierrez,Special Education,95,98,90,88,92,pass`;
          break;
        case "applicants":
          csvContent = `Name,Email,Phone,Programs Applied,Total Attempts,Latest Status,Latest Result
John Doe,john.doe@example.com,+639171234567,"Mathematics, Science",2,completed,pass
Jane Smith,jane.smith@example.com,+639189876543,Elementary Education,1,pending,
Maria Santos,maria.santos@example.com,+639194567890,English Literature,1,approved,
Carlos Rivera,carlos.rivera@example.com,+639176543210,Physical Education,1,approved,
Ana Gutierrez,ana.gutierrez@example.com,+639182345678,Special Education,1,completed,pass`;
          break;
        default:
          csvContent = "No data available for the specified type";
      }

      const blob = new Blob([csvContent], { type: "text/csv" });

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to export to CSV",
      });
      throw error;
    }
  },

  exportToPdf: async (dataType, filters = {}) => {
    try {
      set({ loading: true, error: null });
      await delay(1500);

      // This would generate appropriate PDF content based on dataType
      const pdfContent = `PDF Export - ${dataType.toUpperCase()}
Generated on: ${new Date().toLocaleDateString()}

This is a sample PDF export for ${dataType} data.
In a real implementation, this would contain formatted data based on the selected type and filters.`;

      const blob = new Blob([pdfContent], { type: "application/pdf" });

      set({
        loading: false,
        error: null,
      });

      return blob;
    } catch (error) {
      set({
        loading: false,
        error: "Failed to export to PDF",
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearReports: () => {
    set({
      reportStatistics: null,
      dashboardAnalytics: null,
      error: null,
    });
  },
}));
