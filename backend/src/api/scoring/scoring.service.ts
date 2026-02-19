import {
  Application,
  ApplicationStatus,
} from "@prisma/client";
import prisma from "../../configs/prisma";
import ApiError from "../../utils/ApiError";

// NOTE: Rubric and Score models were removed in migration 20251102_remove_rubric_score_models
// This service is kept as a stub to prevent breaking existing imports
// The scoring functionality has been integrated directly into the Application model

export interface CreateRubricData {
  criteria: string;
  description?: string;
  maxScore?: number;
  weight?: number;
}

export interface UpdateRubricData {
  criteria?: string;
  description?: string;
  maxScore?: number;
  weight?: number;
  isActive?: boolean;
}

export interface CreateScoreData {
  applicationId: number;
  rubricId: number;
  scoreValue: number;
  comments?: string;
}

class ScoringService {
  // Rubric Management - DEPRECATED
  async createRubric(data: CreateRubricData) {
    throw new ApiError(
      410,
      "Rubric functionality has been removed. Use application scoring fields instead.",
    );
  }

  async getAllRubrics(includeInactive = false) {
    throw new ApiError(
      410,
      "Rubric functionality has been removed. Use application scoring fields instead.",
    );
  }

  async getRubricById(id: number) {
    throw new ApiError(
      410,
      "Rubric functionality has been removed. Use application scoring fields instead.",
    );
  }

  async updateRubric(id: number, data: UpdateRubricData) {
    throw new ApiError(
      410,
      "Rubric functionality has been removed. Use application scoring fields instead.",
    );
  }

  async deleteRubric(id: number): Promise<void> {
    throw new ApiError(
      410,
      "Rubric functionality has been removed. Use application scoring fields instead.",
    );
  }

  // Score Management - DEPRECATED
  async createScore(data: CreateScoreData) {
    throw new ApiError(
      410,
      "Score functionality has been removed. Use application scoring fields instead.",
    );
  }

  async getScoresByApplication(applicationId: number) {
    throw new ApiError(
      410,
      "Score functionality has been removed. Use application scoring fields instead.",
    );
  }

  async updateScore(
    applicationId: number,
    rubricId: number,
    scoreValue: number,
    comments?: string,
  ) {
    throw new ApiError(
      410,
      "Score functionality has been removed. Use application scoring fields instead.",
    );
  }

  async deleteScore(applicationId: number, rubricId: number): Promise<void> {
    throw new ApiError(
      410,
      "Score functionality has been removed. Use application scoring fields instead.",
    );
  }

  // Score Calculation and Application Completion
  async calculateApplicationScore(applicationId: number) {
    throw new ApiError(
      410,
      "Scoring functionality has been removed. Use application scoring fields instead.",
    );
  }

  async completeApplicationScoring(applicationId: number): Promise<Application> {
    throw new ApiError(
      410,
      "Scoring functionality has been removed. Use application scoring fields instead.",
    );
  }

  // Analytics and Reports
  async getApplicationScoresSummary(applicationId: number) {
    throw new ApiError(
      410,
      "Scoring functionality has been removed. Use application scoring fields instead.",
    );
  }
}

export default new ScoringService();
