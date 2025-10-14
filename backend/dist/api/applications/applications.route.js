"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applications_controller_1 = require("./applications.controller");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const upload_middleware_1 = require("../../middlewares/upload.middleware");
const router = (0, express_1.Router)();
// Protected routes - require authentication
router.use(auth_middleware_1.default);
// Applicant routes
router.post("/", upload_middleware_1.uploadDocuments, upload_middleware_1.handleUploadError, applications_controller_1.createApplication);
router.get("/my-applications", applications_controller_1.getMyApplications);
router.get("/my-active-application", applications_controller_1.getMyActiveApplication);
// HR/Admin routes
router.get("/", applications_controller_1.getAllApplications);
router.get("/:id", applications_controller_1.getApplicationById);
router.put("/:id", applications_controller_1.updateApplication);
router.delete("/:id", applications_controller_1.deleteApplication);
// Application status management
router.put("/:id/approve", applications_controller_1.approveApplication);
router.put("/:id/reject", applications_controller_1.rejectApplication);
router.put("/:id/schedule", applications_controller_1.scheduleDemo);
router.put("/:id/complete", applications_controller_1.completeApplication);
exports.default = router;
//# sourceMappingURL=applications.route.js.map