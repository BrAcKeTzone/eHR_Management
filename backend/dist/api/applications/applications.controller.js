"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadDocument = exports.scheduleInterview = exports.getApplicationDocuments = exports.rateInterview = exports.completeApplication = exports.deleteApplication = exports.updateApplication = exports.scheduleDemo = exports.rejectApplication = exports.approveApplication = exports.getApplicationById = exports.getAllApplications = exports.getMyActiveApplication = exports.getMyApplications = exports.createApplication = void 0;
const applications_service_1 = __importDefault(require("./applications.service"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
// Helper function to append .pdf to Cloudinary URLs if missing and it's a PDF document
const ensurePdfExtension = (url) => {
    if (!url || typeof url !== "string")
        return url;
    if (url.includes("cloudinary.com") &&
        !url.toLowerCase().endsWith(".pdf") &&
        !url.toLowerCase().endsWith(".png") &&
        !url.toLowerCase().endsWith(".jpg") &&
        !url.toLowerCase().endsWith(".jpeg")) {
        return `${url}.pdf`;
    }
    return url;
};
// Helper function to process application documents JSON
const processApplicationDocuments = (application) => {
    if (!application || !application.documents)
        return application;
    try {
        const documents = JSON.parse(application.documents);
        if (Array.isArray(documents)) {
            const processed = documents.map((doc) => {
                if (doc.url) {
                    doc.url = ensurePdfExtension(doc.url);
                }
                return doc;
            });
            application.documents = JSON.stringify(processed);
        }
    }
    catch (e) {
        console.error("Error processing application documents for retrieval:", e);
    }
    return application;
};
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
            // Only append extension if it's not already in the filename
            const fullFormattedName = formattedFileName
                .toLowerCase()
                .endsWith(`.${extension.toLowerCase()}`)
                ? formattedFileName
                : `${formattedFileName}.${extension}`;
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
    // Process documents to ensure .pdf extension for retrieval
    const processedApplications = applications.map((app) => processApplicationDocuments(app));
    res.json(new ApiResponse_1.default(200, processedApplications, "Applications retrieved successfully"));
});
exports.getMyActiveApplication = (0, asyncHandler_1.default)(async (req, res) => {
    const applicantId = req.user.id;
    if (req.user.role !== "APPLICANT") {
        throw new ApiError_1.default(403, "Only applicants can view their applications");
    }
    const application = await applications_service_1.default.getActiveApplicationByApplicant(applicantId);
    // Process documents for retrieval
    const processedApplication = processApplicationDocuments(application);
    res.json(new ApiResponse_1.default(200, processedApplication, "Active application retrieved successfully"));
});
exports.getAllApplications = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can view all applications");
    }
    const { status, result: resultFilter, finalInterviewResult, interviewEligible, search, page, limit, } = req.query;
    // Convert status and result to uppercase to match enums
    const normalizedStatus = status
        ? status.toUpperCase()
        : undefined;
    const normalizedResult = resultFilter
        ? resultFilter.toUpperCase()
        : undefined;
    const normalizedFinalInterviewResult = finalInterviewResult
        ? finalInterviewResult.toUpperCase()
        : undefined;
    const filters = {
        ...(normalizedStatus && { status: normalizedStatus }),
        ...(normalizedResult && { result: normalizedResult }),
        ...(normalizedFinalInterviewResult && {
            finalInterviewResult: normalizedFinalInterviewResult,
        }),
        ...(typeof interviewEligible !== "undefined" && {
            interviewEligible: interviewEligible === "true",
        }),
        ...(search && { search: search }),
        ...(page && { page: parseInt(page) }),
        ...(limit && { limit: parseInt(limit) }),
    };
    const result = await applications_service_1.default.getAllApplications(filters);
    // Process documents for all applications
    if (result.applications) {
        result.applications = result.applications.map((app) => processApplicationDocuments(app));
    }
    // Debug logging
    console.log("=== getAllApplications Response ===");
    if (result.applications && result.applications.length > 0) {
        console.log("First app object keys:", Object.keys(result.applications[0]));
        console.log("Applicant data:", result.applications[0].applicant);
        console.log("Specialization data:", result.applications[0].specialization);
    }
    res.json(new ApiResponse_1.default(200, result, "Applications retrieved successfully"));
});
exports.getApplicationById = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const applicationId = parseInt(id);
    const application = await applications_service_1.default.getApplicationById(applicationId);
    if (!application) {
        throw new ApiError_1.default(404, "Application not found");
    }
    // Process documents for retrieval
    const processedApplication = processApplicationDocuments(application);
    // Check access permissions
    if (req.user.role === "APPLICANT" &&
        processedApplication.applicant.id !== req.user.id) {
        throw new ApiError_1.default(403, "You can only view your own applications");
    }
    res.json(new ApiResponse_1.default(200, processedApplication, "Application retrieved successfully"));
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
    const { totalScore, // deprecated; kept for backward compatibility
    result: resultFromBody, // deprecated; computed server-side
    hrNotes, feedback, studentLearningActionsScore, knowledgeOfSubjectScore, teachingMethodScore, instructorAttributesScore, } = req.body;
    const applicationId = parseInt(id);
    const asNumber = (value) => {
        const num = parseFloat(value);
        return Number.isFinite(num) ? num : NaN;
    };
    const studentLearning = asNumber(studentLearningActionsScore);
    const knowledge = asNumber(knowledgeOfSubjectScore);
    const teaching = asNumber(teachingMethodScore);
    const attributes = asNumber(instructorAttributesScore);
    if ([studentLearning, knowledge, teaching, attributes].some((v) => isNaN(v))) {
        throw new ApiError_1.default(400, "All scoring categories are required and must be numbers");
    }
    const validators = [
        { value: studentLearning, max: 30, label: "Student Learning Actions" },
        { value: knowledge, max: 30, label: "Knowledge of the Subject Matter" },
        { value: teaching, max: 30, label: "Teaching Method" },
        {
            value: attributes,
            max: 10,
            label: "Instructor's Personal & Professional Attributes",
        },
    ];
    const invalid = validators.find(({ value, max }) => value < 0 || value > max);
    if (invalid) {
        throw new ApiError_1.default(400, `${invalid.label} must be between 0 and ${invalid.max}`);
    }
    const application = await applications_service_1.default.completeApplication(applicationId, {
        studentLearningActionsScore: studentLearning,
        knowledgeOfSubjectScore: knowledge,
        teachingMethodScore: teaching,
        instructorAttributesScore: attributes,
    }, hrNotes, feedback);
    res.json(new ApiResponse_1.default(200, application, "Application scoring saved successfully"));
});
exports.rateInterview = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can rate interviews");
    }
    const { id } = req.params;
    const { interviewScore, interviewResult, interviewNotes, stage } = req.body;
    const applicationId = parseInt(id);
    if (!interviewResult ||
        !["PASS", "FAIL"].includes(interviewResult.toUpperCase())) {
        throw new ApiError_1.default(400, "Valid result (PASS or FAIL) is required");
    }
    const application = await applications_service_1.default.rateInterview(applicationId, interviewScore ? parseFloat(interviewScore) : null, interviewResult.toUpperCase(), interviewNotes, stage === "final" ? "final" : "initial");
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
    const { interviewSchedule, rescheduleReason, stage = "initial" } = req.body;
    const applicationId = parseInt(id);
    if (!["initial", "final"].includes(stage)) {
        throw new ApiError_1.default(400, "Stage must be either 'initial' or 'final'");
    }
    if (!interviewSchedule) {
        throw new ApiError_1.default(400, "Interview schedule date is required");
    }
    const application = await applications_service_1.default.scheduleInterview(applicationId, new Date(interviewSchedule), rescheduleReason, stage);
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