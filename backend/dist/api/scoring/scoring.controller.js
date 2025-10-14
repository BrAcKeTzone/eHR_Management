"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationScoresSummary = exports.completeApplicationScoring = exports.calculateApplicationScore = exports.deleteScore = exports.updateScore = exports.getScoresByApplication = exports.createScore = exports.deleteRubric = exports.updateRubric = exports.getRubricById = exports.getAllRubrics = exports.createRubric = void 0;
const scoring_service_1 = __importDefault(require("./scoring.service"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const prisma_1 = __importDefault(require("../../configs/prisma"));
// Rubric Management
exports.createRubric = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can create rubrics");
    }
    const rubric = await scoring_service_1.default.createRubric(req.body);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, rubric, "Rubric created successfully"));
});
exports.getAllRubrics = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can view rubrics");
    }
    const { includeInactive } = req.query;
    const rubrics = await scoring_service_1.default.getAllRubrics(includeInactive === "true");
    res.json(new ApiResponse_1.default(200, rubrics, "Rubrics retrieved successfully"));
});
exports.getRubricById = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can view rubrics");
    }
    const { id } = req.params;
    const rubric = await scoring_service_1.default.getRubricById(parseInt(id));
    if (!rubric) {
        throw new ApiError_1.default(404, "Rubric not found");
    }
    res.json(new ApiResponse_1.default(200, rubric, "Rubric retrieved successfully"));
});
exports.updateRubric = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can update rubrics");
    }
    const { id } = req.params;
    const rubric = await scoring_service_1.default.updateRubric(parseInt(id), req.body);
    res.json(new ApiResponse_1.default(200, rubric, "Rubric updated successfully"));
});
exports.deleteRubric = (0, asyncHandler_1.default)(async (req, res) => {
    if (req.user.role !== "ADMIN") {
        throw new ApiError_1.default(403, "Only Admin can delete rubrics");
    }
    const { id } = req.params;
    await scoring_service_1.default.deleteRubric(parseInt(id));
    res.json(new ApiResponse_1.default(200, null, "Rubric deleted successfully"));
});
// Score Management
exports.createScore = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can create scores");
    }
    const score = await scoring_service_1.default.createScore(req.body);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, score, "Score created successfully"));
});
exports.getScoresByApplication = (0, asyncHandler_1.default)(async (req, res) => {
    const { applicationId } = req.params;
    const appId = parseInt(applicationId);
    // Check access permissions
    if (req.user.role === "APPLICANT") {
        // Applicants can only view scores for their own applications
        const application = await prisma_1.default.application.findUnique({
            where: { id: appId },
            select: { applicantId: true },
        });
        if (!application || application.applicantId !== req.user.id) {
            throw new ApiError_1.default(403, "You can only view scores for your own applications");
        }
    }
    const scores = await scoring_service_1.default.getScoresByApplication(appId);
    res.json(new ApiResponse_1.default(200, scores, "Scores retrieved successfully"));
});
exports.updateScore = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can update scores");
    }
    const { applicationId, rubricId } = req.params;
    const { scoreValue, comments } = req.body;
    const score = await scoring_service_1.default.updateScore(parseInt(applicationId), parseInt(rubricId), scoreValue, comments);
    res.json(new ApiResponse_1.default(200, score, "Score updated successfully"));
});
exports.deleteScore = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can delete scores");
    }
    const { applicationId, rubricId } = req.params;
    await scoring_service_1.default.deleteScore(parseInt(applicationId), parseInt(rubricId));
    res.json(new ApiResponse_1.default(200, null, "Score deleted successfully"));
});
// Score Calculation and Completion
exports.calculateApplicationScore = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can calculate scores");
    }
    const { applicationId } = req.params;
    const calculation = await scoring_service_1.default.calculateApplicationScore(parseInt(applicationId));
    res.json(new ApiResponse_1.default(200, calculation, "Score calculated successfully"));
});
exports.completeApplicationScoring = (0, asyncHandler_1.default)(async (req, res) => {
    if (!["HR", "ADMIN"].includes(req.user.role)) {
        throw new ApiError_1.default(403, "Only HR and Admin can complete scoring");
    }
    const { applicationId } = req.params;
    const application = await scoring_service_1.default.completeApplicationScoring(parseInt(applicationId));
    res.json(new ApiResponse_1.default(200, application, "Application scoring completed successfully"));
});
exports.getApplicationScoresSummary = (0, asyncHandler_1.default)(async (req, res) => {
    const { applicationId } = req.params;
    const appId = parseInt(applicationId);
    // Check access permissions
    if (req.user.role === "APPLICANT") {
        // Applicants can only view their own application summaries
        const application = await prisma_1.default.application.findUnique({
            where: { id: appId },
            select: { applicantId: true },
        });
        if (!application || application.applicantId !== req.user.id) {
            throw new ApiError_1.default(403, "You can only view your own application summary");
        }
    }
    const summary = await scoring_service_1.default.getApplicationScoresSummary(appId);
    res.json(new ApiResponse_1.default(200, summary, "Application scores summary retrieved successfully"));
});
//# sourceMappingURL=scoring.controller.js.map