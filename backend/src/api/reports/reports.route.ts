import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import {
  getReportStatistics,
  getDashboardAnalytics,
  exportApplicationsCSV,
  exportScoringCSV,
  exportApplicantsCSV,
  generateApplicationsPDF,
  generateScoringPDF,
  generateApplicantsPDF,
} from "./reports.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Statistics and Analytics
router.get("/statistics", getReportStatistics);
router.get("/analytics", getDashboardAnalytics);

// CSV Exports
router.get("/export/applications/csv", exportApplicationsCSV);
router.get("/export/scoring/csv", exportScoringCSV);
router.get("/export/applicants/csv", exportApplicantsCSV);

// PDF Exports
router.get("/export/applications/pdf", generateApplicationsPDF);
router.get("/export/scoring/pdf", generateScoringPDF);
router.get("/export/applicants/pdf", generateApplicantsPDF);

export default router;
