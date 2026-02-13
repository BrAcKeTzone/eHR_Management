"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../configs/prisma"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const notifications_service_1 = __importDefault(require("../notifications/notifications.service"));
class ScoringService {
    // Rubric Management
    async createRubric(data) {
        return await prisma_1.default.rubric.create({
            data: {
                ...data,
                maxScore: data.maxScore || 10,
                weight: data.weight || 1.0,
                isActive: true,
            },
        });
    }
    async getAllRubrics(includeInactive = false) {
        return await prisma_1.default.rubric.findMany({
            where: includeInactive ? {} : { isActive: true },
            orderBy: { createdAt: "asc" },
        });
    }
    async getRubricById(id) {
        return await prisma_1.default.rubric.findUnique({ where: { id } });
    }
    async updateRubric(id, data) {
        const rubric = await prisma_1.default.rubric.findUnique({ where: { id } });
        if (!rubric) {
            throw new ApiError_1.default(404, "Rubric not found");
        }
        return await prisma_1.default.rubric.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }
    async deleteRubric(id) {
        const rubric = await prisma_1.default.rubric.findUnique({ where: { id } });
        if (!rubric) {
            throw new ApiError_1.default(404, "Rubric not found");
        }
        // Check if rubric has associated scores
        const scoresCount = await prisma_1.default.score.count({
            where: { rubricId: id },
        });
        if (scoresCount > 0) {
            // Soft delete by marking as inactive
            await prisma_1.default.rubric.update({
                where: { id },
                data: { isActive: false },
            });
        }
        else {
            // Hard delete if no scores exist
            await prisma_1.default.rubric.delete({ where: { id } });
        }
    }
    // Score Management
    async createScore(data) {
        // Verify application exists and is approved
        const application = await prisma_1.default.application.findUnique({
            where: { id: data.applicationId },
        });
        if (!application) {
            throw new ApiError_1.default(404, "Application not found");
        }
        if (application.status !== "APPROVED") {
            throw new ApiError_1.default(400, "Can only score approved applications");
        }
        // Verify rubric exists and is active
        const rubric = await prisma_1.default.rubric.findUnique({
            where: { id: data.rubricId },
        });
        if (!rubric || !rubric.isActive) {
            throw new ApiError_1.default(404, "Rubric not found or inactive");
        }
        // Validate score value
        if (data.scoreValue < 0 || data.scoreValue > rubric.maxScore) {
            throw new ApiError_1.default(400, `Score must be between 0 and ${rubric.maxScore}`);
        }
        // Create or update score
        return await prisma_1.default.score.upsert({
            where: {
                applicationId_rubricId: {
                    applicationId: data.applicationId,
                    rubricId: data.rubricId,
                },
            },
            update: {
                scoreValue: data.scoreValue,
                comments: data.comments,
                updatedAt: new Date(),
            },
            create: data,
        });
    }
    async getScoresByApplication(applicationId) {
        return await prisma_1.default.score.findMany({
            where: { applicationId },
            include: { rubric: true },
            orderBy: { rubric: { createdAt: "asc" } },
        });
    }
    async updateScore(applicationId, rubricId, scoreValue, comments) {
        const score = await prisma_1.default.score.findUnique({
            where: {
                applicationId_rubricId: {
                    applicationId,
                    rubricId,
                },
            },
            include: { rubric: true },
        });
        if (!score) {
            throw new ApiError_1.default(404, "Score not found");
        }
        // Validate score value
        if (scoreValue < 0 || scoreValue > score.rubric.maxScore) {
            throw new ApiError_1.default(400, `Score must be between 0 and ${score.rubric.maxScore}`);
        }
        return await prisma_1.default.score.update({
            where: {
                applicationId_rubricId: {
                    applicationId,
                    rubricId,
                },
            },
            data: {
                scoreValue,
                comments,
                updatedAt: new Date(),
            },
        });
    }
    async deleteScore(applicationId, rubricId) {
        const score = await prisma_1.default.score.findUnique({
            where: {
                applicationId_rubricId: {
                    applicationId,
                    rubricId,
                },
            },
        });
        if (!score) {
            throw new ApiError_1.default(404, "Score not found");
        }
        await prisma_1.default.score.delete({
            where: {
                applicationId_rubricId: {
                    applicationId,
                    rubricId,
                },
            },
        });
    }
    // Score Calculation and Application Completion
    async calculateApplicationScore(applicationId) {
        const scores = await this.getScoresByApplication(applicationId);
        if (scores.length === 0) {
            throw new ApiError_1.default(400, "No scores found for this application");
        }
        // Calculate weighted total score
        let totalScore = 0;
        let maxPossibleScore = 0;
        scores.forEach((score) => {
            const weightedScore = score.scoreValue * score.rubric.weight;
            const maxWeightedScore = score.rubric.maxScore * score.rubric.weight;
            totalScore += weightedScore;
            maxPossibleScore += maxWeightedScore;
        });
        const percentage = (totalScore / maxPossibleScore) * 100;
        // Determine pass/fail (assuming 70% is passing)
        const passingPercentage = parseFloat(process.env.PASSING_SCORE_PERCENTAGE || "70");
        const result = percentage >= passingPercentage ? "PASS" : "FAIL";
        return {
            totalScore,
            maxPossibleScore,
            percentage,
            result,
            scores,
        };
    }
    async completeApplicationScoring(applicationId) {
        const calculation = await this.calculateApplicationScore(applicationId);
        // Update application with calculated scores and mark as completed
        const updateData = {
            totalScore: calculation.percentage, // Store as percentage
            result: calculation.result,
            updatedAt: new Date(),
        };
        // Mark as REJECTED if demo result is FAIL; do not mark as COMPLETED on demo PASS
        if ((calculation.result || "").toUpperCase() === "FAIL") {
            updateData.status = client_1.ApplicationStatus.REJECTED;
        }
        // If demo passed, mark as interview eligible
        if ((calculation.result || "").toUpperCase() === "PASS") {
            updateData.interviewEligible = true;
        }
        const application = await prisma_1.default.application.update({
            where: { id: applicationId },
            data: updateData,
        });
        // Get applicant details for notification
        const applicant = await prisma_1.default.user.findUnique({
            where: { id: application.applicantId },
        });
        if (applicant) {
            // Send results notification asynchronously
            notifications_service_1.default
                .sendResultsNotification(application, applicant, calculation.scores)
                .catch((error) => console.error("Failed to send results notification:", error));
        }
        return application;
    }
    // Analytics and Reports
    async getApplicationScoresSummary(applicationId) {
        const application = await prisma_1.default.application.findUnique({
            where: { id: applicationId },
        });
        if (!application) {
            throw new ApiError_1.default(404, "Application not found");
        }
        const scores = await this.getScoresByApplication(applicationId);
        let summary = {
            totalScore: 0,
            maxPossibleScore: 0,
            percentage: 0,
            result: application.result,
        };
        if (scores.length > 0) {
            const calculation = await this.calculateApplicationScore(applicationId);
            summary = {
                totalScore: calculation.totalScore,
                maxPossibleScore: calculation.maxPossibleScore,
                percentage: calculation.percentage,
                result: calculation.result,
            };
        }
        return {
            application,
            scores,
            summary,
        };
    }
}
exports.default = new ScoringService();
//# sourceMappingURL=scoring.service.js.map