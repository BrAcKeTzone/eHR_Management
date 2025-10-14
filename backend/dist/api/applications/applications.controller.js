"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeApplication = exports.deleteApplication = exports.updateApplication = exports.scheduleDemo = exports.rejectApplication = exports.approveApplication = exports.getApplicationById = exports.getAllApplications = exports.getMyActiveApplication = exports.getMyApplications = exports.createApplication = void 0;
const client_1 = require("@prisma/client");
const applications_service_1 = __importDefault(require("./applications.service"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
exports.createApplication = (0, asyncHandler_1.default)(async (req, res) => {
    const { program, documents: frontendDocuments, ...applicationData } = req.body;
    const applicantId = req.user.id;
    if (req.user.role !== "APPLICANT") {
        throw new ApiError_1.default(403, "Only applicants can create applications");
    }
    // Handle uploaded files
    let documents = [];
    if (req.files && Array.isArray(req.files)) {
        documents = req.files.map((file) => JSON.stringify({
            originalName: file.originalname,
            fileName: file.filename,
            url: file.path,
            size: file.size,
            mimetype: file.mimetype,
            uploadedAt: new Date().toISOString(),
        }));
    }
    const application = await applications_service_1.default.createApplication({
        program: program || "Teaching Application",
        documents: JSON.stringify(documents),
        applicantId,
        ...applicationData,
    });
    res
        .status(201)
        .json(new ApiResponse_1.default(201, application, "Application created successfully"));
});
exports.getMyApplications = (0, asyncHandler_1.default)(async (req, res) => {
    const applicantId = req.user.id;
    if (req.user.role !== "APPLICANT") {
        throw new ApiError_1.default(403, "Only applicants can view their applications");
    }
    const applications = await applications_service_1.default.getApplicationsByApplicant(applicantId);
    res.json(new ApiResponse_1.default(200, applications, "Applications retrieved successfully"));
});
exports.getMyActiveApplication = (0, asyncHandler_1.default)(async (req, res) => {
    const applicantId = req.user.id;
    if (req.user.role !== "APPLICANT") {
        throw new ApiError_1.default(403, "Only applicants can view their applications");
    }
    const application = await applications_service_1.default.getActiveApplicationByApplicant(applicantId);
    res.json(new ApiResponse_1.default(200, application, "Active application retrieved successfully"));
});
exports.getAllApplications = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can view all applications");
    }
    const { status, result: resultFilter, search, page, limit } = req.query;
    // Convert status and result to uppercase to match enums
    const normalizedStatus = status
        ? status.toUpperCase()
        : undefined;
    const normalizedResult = resultFilter
        ? resultFilter.toUpperCase()
        : undefined;
    const filters = {
        ...(normalizedStatus && { status: normalizedStatus }),
        ...(normalizedResult && { result: normalizedResult }),
        ...(search && { search: search }),
        ...(page && { page: parseInt(page) }),
        ...(limit && { limit: parseInt(limit) }),
    };
    const result = await applications_service_1.default.getAllApplications(filters);
    res.json(new ApiResponse_1.default(200, result, "Applications retrieved successfully"));
});
exports.getApplicationById = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const applicationId = parseInt(id);
    const application = await applications_service_1.default.getApplicationById(applicationId);
    if (!application) {
        throw new ApiError_1.default(404, "Application not found");
    }
    // Check access permissions
    if (req.user.role === "APPLICANT" &&
        application.applicant.id !== req.user.id) {
        throw new ApiError_1.default(403, "You can only view your own applications");
    }
    res.json(new ApiResponse_1.default(200, application, "Application retrieved successfully"));
});
exports.approveApplication = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can approve applications");
    }
    const { id } = req.params;
    const { hrNotes } = req.body;
    const applicationId = parseInt(id);
    const application = await applications_service_1.default.approveApplication(applicationId, hrNotes);
    res.json(new ApiResponse_1.default(200, application, "Application approved successfully"));
});
exports.rejectApplication = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can reject applications");
    }
    const { id } = req.params;
    const { hrNotes } = req.body;
    const applicationId = parseInt(id);
    const application = await applications_service_1.default.rejectApplication(applicationId, hrNotes);
    res.json(new ApiResponse_1.default(200, application, "Application rejected successfully"));
});
exports.scheduleDemo = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can schedule demos");
    }
    const { id } = req.params;
    const { demoSchedule, demoLocation, demoDuration, demoNotes } = req.body;
    const applicationId = parseInt(id);
    if (!demoSchedule) {
        throw new ApiError_1.default(400, "Demo schedule date is required");
    }
    const application = await applications_service_1.default.scheduleDemo(applicationId, new Date(demoSchedule), demoLocation, demoDuration ? parseInt(demoDuration) : undefined, demoNotes);
    res.json(new ApiResponse_1.default(200, application, "Demo scheduled successfully"));
});
exports.updateApplication = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can update applications");
    }
    const { id } = req.params;
    const updateData = req.body;
    const applicationId = parseInt(id);
    const application = await applications_service_1.default.updateApplication(applicationId, updateData);
    res.json(new ApiResponse_1.default(200, application, "Application updated successfully"));
});
exports.deleteApplication = (0, asyncHandler_1.default)(async (req, res) => {
    if (req.user.role !== "ADMIN") {
        throw new ApiError_1.default(403, "Only Admin can delete applications");
    }
    const { id } = req.params;
    const applicationId = parseInt(id);
    await applications_service_1.default.deleteApplication(applicationId);
    res.json(new ApiResponse_1.default(200, null, "Application deleted successfully"));
});
exports.completeApplication = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can complete applications");
    }
    const { id } = req.params;
    const { totalScore, result, hrNotes } = req.body;
    const applicationId = parseInt(id);
    if (totalScore === undefined || totalScore === null) {
        throw new ApiError_1.default(400, "Total score is required");
    }
    if (!result || !["PASS", "FAIL"].includes(result.toUpperCase())) {
        throw new ApiError_1.default(400, "Valid result (PASS or FAIL) is required");
    }
    // Update application with score, result, and optional notes
    const updateData = {
        totalScore: parseFloat(totalScore),
        result: result.toUpperCase(),
        status: client_1.ApplicationStatus.COMPLETED,
    };
    if (hrNotes) {
        updateData.hrNotes = hrNotes;
    }
    const application = await applications_service_1.default.updateApplication(applicationId, updateData);
    res.json(new ApiResponse_1.default(200, application, "Application completed successfully"));
});
//# sourceMappingURL=applications.controller.js.map