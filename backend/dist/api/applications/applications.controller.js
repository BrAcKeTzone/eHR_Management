"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadDocument = exports.scheduleInterview = exports.getApplicationDocuments = exports.rateInterview = exports.completeApplication = exports.deleteApplication = exports.updateApplication = exports.scheduleDemo = exports.rejectApplication = exports.approveApplication = exports.getApplicationById = exports.getAllApplications = exports.getMyActiveApplication = exports.getMyApplications = exports.createApplication = void 0;
const client_1 = require("@prisma/client");
const applications_service_1 = __importDefault(require("./applications.service"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
exports.createApplication = (0, asyncHandler_1.default)(async (req, res) => {
    console.log("=== Create Application Request ===");
    console.log("User:", req.user?.id, req.user?.role);
    console.log("Body keys:", Object.keys(req.body));
    console.log("Files received:", req.files ? req.files.length : 0);
    const { program, documents: frontendDocuments, documentTypes, applicantFirstName, applicantLastName, ...applicationData } = req.body;
    const applicantId = req.user.id;
    if (req.user.role !== "APPLICANT") {
        throw new ApiError_1.default(403, "Only applicants can create applications");
    }
    // Handle uploaded files from Cloudinary
    let documentsJson = "[]";
    if (req.files && Array.isArray(req.files)) {
        console.log("Processing", req.files.length, "files...");
        const documents = req.files.map((file) => {
            console.log("File object keys:", Object.keys(file));
            console.log("File details:", {
                originalname: file.originalname,
                filename: file.filename,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype,
            });
            // Extract the formatted filename from the path
            // file.filename contains the full public_id like "hr-applications/Resume_ManiwangJohnPaul_2025-12-07T15-08-51-693Z"
            const formattedFileName = file.filename
                ? file.filename.split("/").pop() || file.originalname
                : file.originalname;
            // Get file extension from original filename
            const extension = file.originalname.split(".").pop() || "pdf";
            const fullFormattedName = `${formattedFileName}.${extension}`;
            return {
                originalName: file.originalname,
                fileName: fullFormattedName, // Use formatted name with extension
                url: file.path || file.url, // Cloudinary URL
                publicId: file.filename || "", // Full public_id for Cloudinary operations
                size: file.size || 0,
                mimetype: file.mimetype || "application/octet-stream",
                uploadedAt: new Date().toISOString(),
            };
        });
        documentsJson = JSON.stringify(documents);
        console.log("Documents JSON length:", documentsJson.length);
    }
    const application = await applications_service_1.default.createApplication({
        documents: documentsJson,
        applicantId,
        ...applicationData,
    });
    console.log("Application created successfully:", application.id);
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
    const { status, result: resultFilter, interviewEligible, search, page, limit, } = req.query;
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
        ...(typeof interviewEligible !== "undefined" && {
            interviewEligible: interviewEligible === "true",
        }),
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
    const { demoSchedule, demoLocation, demoDuration, demoNotes, rescheduleReason, } = req.body;
    const applicationId = parseInt(id);
    if (!demoSchedule) {
        throw new ApiError_1.default(400, "Demo schedule date is required");
    }
    // Determine if this is a reschedule so we can validate the input
    const existingApp = await applications_service_1.default.getApplicationById(applicationId);
    const isReschedule = existingApp?.demoSchedule;
    if (isReschedule && !rescheduleReason) {
        throw new ApiError_1.default(400, "Reschedule reason is required when updating an existing demo schedule");
    }
    // If rescheduleReason is provided, validate allowed values
    const allowedReasons = ["APPLICANT_NO_SHOW", "SCHOOL"];
    if (rescheduleReason && !allowedReasons.includes(rescheduleReason)) {
        throw new ApiError_1.default(400, `Invalid reschedule reason. Allowed: ${allowedReasons.join(", ")}`);
    }
    const application = await applications_service_1.default.scheduleDemo(applicationId, new Date(demoSchedule), demoLocation, demoDuration ? parseInt(demoDuration) : undefined, demoNotes, rescheduleReason);
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
    // mark the application as interviewEligible if score is >= 75
    const numericScore = parseFloat(totalScore);
    if (!isNaN(numericScore)) {
        updateData.interviewEligible = numericScore >= 75;
    }
    const application = await applications_service_1.default.updateApplication(applicationId, updateData);
    res.json(new ApiResponse_1.default(200, application, "Application completed successfully"));
});
exports.rateInterview = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can rate interviews");
    }
    const { id } = req.params;
    const { interviewScore, interviewResult, interviewNotes } = req.body;
    const applicationId = parseInt(id);
    if (!interviewResult ||
        !["PASS", "FAIL"].includes(interviewResult.toUpperCase())) {
        throw new ApiError_1.default(400, "Valid result (PASS or FAIL) is required");
    }
    const application = await applications_service_1.default.rateInterview(applicationId, interviewScore ? parseFloat(interviewScore) : null, interviewResult.toUpperCase(), interviewNotes);
    // Get the full application with applicant details and format it
    const formattedApplication = await applications_service_1.default.getApplicationById(applicationId);
    res.json(new ApiResponse_1.default(200, formattedApplication, "Interview rated successfully"));
});
exports.getApplicationDocuments = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const applicationId = parseInt(id);
    // Get the application with documents
    const application = await applications_service_1.default.getApplicationById(applicationId);
    if (!application) {
        throw new ApiError_1.default(404, "Application not found");
    }
    // Check authorization - applicants can only view their own, HR/Admin can view all
    if (req.user.role === "APPLICANT" &&
        application.applicantId !== req.user.id) {
        throw new ApiError_1.default(403, "You can only view documents from your own applications");
    }
    // Parse documents JSON
    let documents = [];
    try {
        if (application.documents) {
            documents = JSON.parse(application.documents);
        }
    }
    catch (error) {
        console.error("Error parsing documents:", error);
        documents = [];
    }
    res.json(new ApiResponse_1.default(200, { documents, applicationId: application.id }, "Documents retrieved successfully"));
});
exports.scheduleInterview = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can schedule interviews");
    }
    const { id } = req.params;
    const { interviewSchedule, rescheduleReason } = req.body;
    const applicationId = parseInt(id);
    if (!interviewSchedule) {
        throw new ApiError_1.default(400, "Interview schedule date is required");
    }
    const application = await applications_service_1.default.scheduleInterview(applicationId, new Date(interviewSchedule), rescheduleReason);
    // Get the full application with applicant details and format it
    const formattedApplication = await applications_service_1.default.getApplicationById(applicationId);
    res.json(new ApiResponse_1.default(200, formattedApplication, "Interview scheduled successfully"));
});
exports.downloadDocument = (0, asyncHandler_1.default)(async (req, res) => {
    const { id, documentIndex } = req.params;
    const applicationId = parseInt(id);
    const docIndex = parseInt(documentIndex);
    // Get the application
    const application = await applications_service_1.default.getApplicationById(applicationId);
    if (!application) {
        throw new ApiError_1.default(404, "Application not found");
    }
    // Check authorization
    if (req.user.role === "APPLICANT" &&
        application.applicantId !== req.user.id) {
        throw new ApiError_1.default(403, "You can only download documents from your own applications");
    }
    // Parse documents
    let documents = [];
    try {
        if (application.documents) {
            documents = JSON.parse(application.documents);
        }
    }
    catch (error) {
        throw new ApiError_1.default(500, "Error parsing application documents");
    }
    // Check if document exists
    if (docIndex < 0 || docIndex >= documents.length) {
        throw new ApiError_1.default(404, "Document not found");
    }
    const document = documents[docIndex];
    // Redirect to Cloudinary URL
    // Cloudinary URLs are already public and accessible
    res.redirect(document.url);
});
//# sourceMappingURL=applications.controller.js.map