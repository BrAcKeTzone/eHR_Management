"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const reports_controller_1 = require("./reports.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.default);
// Statistics and Analytics
router.get("/statistics", reports_controller_1.getReportStatistics);
router.get("/analytics", reports_controller_1.getDashboardAnalytics);
// CSV Exports
router.get("/export/applications/csv", reports_controller_1.exportApplicationsCSV);
router.get("/export/scoring/csv", reports_controller_1.exportScoringCSV);
router.get("/export/applicants/csv", reports_controller_1.exportApplicantsCSV);
// PDF Exports
router.get("/export/applications/pdf", reports_controller_1.generateApplicationsPDF);
router.get("/export/scoring/pdf", reports_controller_1.generateScoringPDF);
router.get("/export/applicants/pdf", reports_controller_1.generateApplicantsPDF);
exports.default = router;
//# sourceMappingURL=reports.route.js.map