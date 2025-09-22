import {
  Rubric,
  Score,
  Application,
  ApplicationResult,
  Prisma,
} from "@prisma/client";
import prisma from "../../configs/prisma";
import ApiError from "../../utils/ApiError";
import notificationService from "../notifications/notifications.service";

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

export interface RubricWithScores extends Rubric {
  scores: Score[];
}

export interface ApplicationWithScores extends Application {
  scores: (Score & { rubric: Rubric })[];
}

class ScoringService {
  // Rubric Management
  async createRubric(data: CreateRubricData): Promise<Rubric> {
    return await prisma.rubric.create({
      data: {
        ...data,
        maxScore: data.maxScore || 10,
        weight: data.weight || 1.0,
        isActive: true,
      },
    });
  }

  async getAllRubrics(includeInactive = false): Promise<Rubric[]> {
    return await prisma.rubric.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async getRubricById(id: number): Promise<Rubric | null> {
    return await prisma.rubric.findUnique({ where: { id } });
  }

  async updateRubric(id: number, data: UpdateRubricData): Promise<Rubric> {
    const rubric = await prisma.rubric.findUnique({ where: { id } });

    if (!rubric) {
      throw new ApiError(404, "Rubric not found");
    }

    return await prisma.rubric.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteRubric(id: number): Promise<void> {
    const rubric = await prisma.rubric.findUnique({ where: { id } });

    if (!rubric) {
      throw new ApiError(404, "Rubric not found");
    }

    // Check if rubric has associated scores
    const scoresCount = await prisma.score.count({
      where: { rubricId: id },
    });

    if (scoresCount > 0) {
      // Soft delete by marking as inactive
      await prisma.rubric.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      // Hard delete if no scores exist
      await prisma.rubric.delete({ where: { id } });
    }
  }

  // Score Management
  async createScore(data: CreateScoreData): Promise<Score> {
    // Verify application exists and is approved
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
    });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    if (application.status !== "APPROVED") {
      throw new ApiError(400, "Can only score approved applications");
    }

    // Verify rubric exists and is active
    const rubric = await prisma.rubric.findUnique({
      where: { id: data.rubricId },
    });

    if (!rubric || !rubric.isActive) {
      throw new ApiError(404, "Rubric not found or inactive");
    }

    // Validate score value
    if (data.scoreValue < 0 || data.scoreValue > rubric.maxScore) {
      throw new ApiError(400, `Score must be between 0 and ${rubric.maxScore}`);
    }

    // Create or update score
    return await prisma.score.upsert({
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

  async getScoresByApplication(
    applicationId: number
  ): Promise<(Score & { rubric: Rubric })[]> {
    return await prisma.score.findMany({
      where: { applicationId },
      include: { rubric: true },
      orderBy: { rubric: { createdAt: "asc" } },
    });
  }

  async updateScore(
    applicationId: number,
    rubricId: number,
    scoreValue: number,
    comments?: string
  ): Promise<Score> {
    const score = await prisma.score.findUnique({
      where: {
        applicationId_rubricId: {
          applicationId,
          rubricId,
        },
      },
      include: { rubric: true },
    });

    if (!score) {
      throw new ApiError(404, "Score not found");
    }

    // Validate score value
    if (scoreValue < 0 || scoreValue > score.rubric.maxScore) {
      throw new ApiError(
        400,
        `Score must be between 0 and ${score.rubric.maxScore}`
      );
    }

    return await prisma.score.update({
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

  async deleteScore(applicationId: number, rubricId: number): Promise<void> {
    const score = await prisma.score.findUnique({
      where: {
        applicationId_rubricId: {
          applicationId,
          rubricId,
        },
      },
    });

    if (!score) {
      throw new ApiError(404, "Score not found");
    }

    await prisma.score.delete({
      where: {
        applicationId_rubricId: {
          applicationId,
          rubricId,
        },
      },
    });
  }

  // Score Calculation and Application Completion
  async calculateApplicationScore(applicationId: number): Promise<{
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    result: ApplicationResult;
    scores: (Score & { rubric: Rubric })[];
  }> {
    const scores = await this.getScoresByApplication(applicationId);

    if (scores.length === 0) {
      throw new ApiError(400, "No scores found for this application");
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
    const passingPercentage = parseFloat(
      process.env.PASSING_SCORE_PERCENTAGE || "70"
    );
    const result: ApplicationResult =
      percentage >= passingPercentage ? "PASS" : "FAIL";

    return {
      totalScore,
      maxPossibleScore,
      percentage,
      result,
      scores,
    };
  }

  async completeApplicationScoring(
    applicationId: number
  ): Promise<Application> {
    const calculation = await this.calculateApplicationScore(applicationId);

    // Update application with calculated scores and mark as completed
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        totalScore: calculation.percentage, // Store as percentage
        result: calculation.result,
        status: "COMPLETED",
        updatedAt: new Date(),
      },
    });

    // Get applicant details for notification
    const applicant = await prisma.user.findUnique({
      where: { id: application.applicantId },
    });

    if (applicant) {
      // Send results notification asynchronously
      notificationService
        .sendResultsNotification(application, applicant, calculation.scores)
        .catch((error) =>
          console.error("Failed to send results notification:", error)
        );
    }

    return application;
  }

  // Analytics and Reports
  async getApplicationScoresSummary(applicationId: number): Promise<{
    application: Application;
    scores: (Score & { rubric: Rubric })[];
    summary: {
      totalScore: number;
      maxPossibleScore: number;
      percentage: number;
      result: ApplicationResult | null;
    };
  }> {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new ApiError(404, "Application not found");
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

export default new ScoringService();
