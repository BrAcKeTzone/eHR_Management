"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scoring_controller_1 = require("./scoring.controller");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
// Protected routes - require authentication
router.use(auth_middleware_1.default);
// Rubric Management Routes
router.post("/rubrics", scoring_controller_1.createRubric);
router.get("/rubrics", scoring_controller_1.getAllRubrics);
router.get("/rubrics/:id", scoring_controller_1.getRubricById);
router.put("/rubrics/:id", scoring_controller_1.updateRubric);
router.delete("/rubrics/:id", scoring_controller_1.deleteRubric);
// Score Management Routes
router.post("/scores", scoring_controller_1.createScore);
router.get("/applications/:applicationId/scores", scoring_controller_1.getScoresByApplication);
router.put("/applications/:applicationId/scores/:rubricId", scoring_controller_1.updateScore);
router.delete("/applications/:applicationId/scores/:rubricId", scoring_controller_1.deleteScore);
// Score Calculation Routes
router.get("/applications/:applicationId/calculate", scoring_controller_1.calculateApplicationScore);
router.post("/applications/:applicationId/complete", scoring_controller_1.completeApplicationScoring);
router.get("/applications/:applicationId/summary", scoring_controller_1.getApplicationScoresSummary);
exports.default = router;
//# sourceMappingURL=scoring.route.js.map