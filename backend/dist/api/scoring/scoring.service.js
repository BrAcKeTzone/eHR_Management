"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
class ScoringService {
    // Rubric Management - DEPRECATED
    async createRubric(data) {
        throw new ApiError_1.default(410, "Rubric functionality has been removed. Use application scoring fields instead.");
    }
    async getAllRubrics(includeInactive = false) {
        throw new ApiError_1.default(410, "Rubric functionality has been removed. Use application scoring fields instead.");
    }
    async getRubricById(id) {
        throw new ApiError_1.default(410, "Rubric functionality has been removed. Use application scoring fields instead.");
    }
    async updateRubric(id, data) {
        throw new ApiError_1.default(410, "Rubric functionality has been removed. Use application scoring fields instead.");
    }
    async deleteRubric(id) {
        throw new ApiError_1.default(410, "Rubric functionality has been removed. Use application scoring fields instead.");
    }
    // Score Management - DEPRECATED
    async createScore(data) {
        throw new ApiError_1.default(410, "Score functionality has been removed. Use application scoring fields instead.");
    }
    async getScoresByApplication(applicationId) {
        throw new ApiError_1.default(410, "Score functionality has been removed. Use application scoring fields instead.");
    }
    async updateScore(applicationId, rubricId, scoreValue, comments) {
        throw new ApiError_1.default(410, "Score functionality has been removed. Use application scoring fields instead.");
    }
    async deleteScore(applicationId, rubricId) {
        throw new ApiError_1.default(410, "Score functionality has been removed. Use application scoring fields instead.");
    }
    // Score Calculation and Application Completion
    async calculateApplicationScore(applicationId) {
        throw new ApiError_1.default(410, "Scoring functionality has been removed. Use application scoring fields instead.");
    }
    async completeApplicationScoring(applicationId) {
        throw new ApiError_1.default(410, "Scoring functionality has been removed. Use application scoring fields instead.");
    }
    // Analytics and Reports
    async getApplicationScoresSummary(applicationId) {
        throw new ApiError_1.default(410, "Scoring functionality has been removed. Use application scoring fields instead.");
    }
}
exports.default = new ScoringService();
//# sourceMappingURL=scoring.service.js.map