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
} from "./applications.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import {
  uploadDocuments,
  handleUploadError,
} from "../../middlewares/upload.middleware";

const router = Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Applicant routes
router.post("/", uploadDocuments, handleUploadError, createApplication);
router.get("/my-applications", getMyApplications);
router.get("/my-active-application", getMyActiveApplication);

// HR/Admin routes
router.get("/", getAllApplications);
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

// Application status management
router.put("/:id/approve", approveApplication);
router.put("/:id/reject", rejectApplication);
router.put("/:id/schedule", scheduleDemo);

export default router;
