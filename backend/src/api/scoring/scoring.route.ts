import { Router } from "express";
import {
  createRubric,
  getAllRubrics,
  getRubricById,
  updateRubric,
  deleteRubric,
  createScore,
  getScoresByApplication,
  updateScore,
  deleteScore,
  calculateApplicationScore,
  completeApplicationScoring,
  getApplicationScoresSummary,
} from "./scoring.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const router = Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Rubric Management Routes
router.post("/rubrics", createRubric);
router.get("/rubrics", getAllRubrics);
router.get("/rubrics/:id", getRubricById);
router.put("/rubrics/:id", updateRubric);
router.delete("/rubrics/:id", deleteRubric);

// Score Management Routes
router.post("/scores", createScore);
router.get("/applications/:applicationId/scores", getScoresByApplication);
router.put("/applications/:applicationId/scores/:rubricId", updateScore);
router.delete("/applications/:applicationId/scores/:rubricId", deleteScore);

// Score Calculation Routes
router.get("/applications/:applicationId/calculate", calculateApplicationScore);
router.post(
  "/applications/:applicationId/complete",
  completeApplicationScoring
);
router.get("/applications/:applicationId/summary", getApplicationScoresSummary);

export default router;
