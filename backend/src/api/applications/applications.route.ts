import { Router } from "express";
import {
  createApplication,
  getMyApplications,
  getMyActiveApplication,
  getAllApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  scheduleDemo,
  updateApplication,
  deleteApplication,
  completeApplication,
  getApplicationDocuments,
  downloadDocument,
} from "./applications.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import {
  uploadDocuments,
  uploadApplicationDocuments,
  handleUploadError,
} from "../../middlewares/upload.middleware";

const router = Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Applicant routes
router.post(
  "/",
  uploadApplicationDocuments,
  handleUploadError,
  createApplication
);
router.get("/my-applications", getMyApplications);
router.get("/my-active-application", getMyActiveApplication);

// HR/Admin routes
router.get("/", getAllApplications);
router.get("/:id", getApplicationById);
router.get("/:id/documents", getApplicationDocuments); // Get list of documents
router.get("/:id/documents/:documentIndex/download", downloadDocument); // Download specific document
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

// Application status management
router.put("/:id/approve", approveApplication);
router.put("/:id/reject", rejectApplication);
router.put("/:id/schedule", scheduleDemo);
router.put("/:id/complete", completeApplication);

export default router;
