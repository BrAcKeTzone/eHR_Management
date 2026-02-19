import { Request, Response } from "express";
import scoringService from "./scoring.service";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import asyncHandler from "../../utils/asyncHandler";
import prisma from "../../configs/prisma";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    email: string;
  };
}

// Rubric Management
export const createRubric = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can create rubrics");
    }

    const rubric = await scoringService.createRubric(req.body);

    res
      .status(201)
      .json(new ApiResponse(201, rubric, "Rubric created successfully"));
  }
);

export const getAllRubrics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can view rubrics");
    }

    const { includeInactive } = req.query;
    const rubrics = await scoringService.getAllRubrics(
      includeInactive === "true"
    );

    res.json(new ApiResponse(200, rubrics, "Rubrics retrieved successfully"));
  }
);

export const getRubricById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can view rubrics");
    }

    const { id } = req.params;
    await scoringService.getRubricById(parseInt(id));
  }
);

export const updateRubric = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can update rubrics");
    }

    const { id } = req.params;
    const rubric = await scoringService.updateRubric(parseInt(id), req.body);

    res.json(new ApiResponse(200, rubric, "Rubric updated successfully"));
  }
);

export const deleteRubric = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== "ADMIN") {
      throw new ApiError(403, "Only Admin can delete rubrics");
    }

    const { id } = req.params;
    await scoringService.deleteRubric(parseInt(id));

    res.json(new ApiResponse(200, null, "Rubric deleted successfully"));
  }
);

// Score Management
export const createScore = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can create scores");
    }

    const score = await scoringService.createScore(req.body);

    res
      .status(201)
      .json(new ApiResponse(201, score, "Score created successfully"));
  }
);

export const getScoresByApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { applicationId } = req.params;
    const appId = parseInt(applicationId);

    // Check access permissions
    if (req.user!.role === "APPLICANT") {
      // Applicants can only view scores for their own applications
      const application = await prisma.application.findUnique({
        where: { id: appId },
        select: { applicantId: true },
      });

      if (!application || application.applicantId !== req.user!.id) {
        throw new ApiError(
          403,
          "You can only view scores for your own applications"
        );
      }
    }

    const scores = await scoringService.getScoresByApplication(appId);

    res.json(new ApiResponse(200, scores, "Scores retrieved successfully"));
  }
);

export const updateScore = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can update scores");
    }

    const { applicationId, rubricId } = req.params;
    const { scoreValue, comments } = req.body;

    const score = await scoringService.updateScore(
      parseInt(applicationId),
      parseInt(rubricId),
      scoreValue,
      comments
    );

    res.json(new ApiResponse(200, score, "Score updated successfully"));
  }
);

export const deleteScore = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can delete scores");
    }

    const { applicationId, rubricId } = req.params;

    await scoringService.deleteScore(
      parseInt(applicationId),
      parseInt(rubricId)
    );

    res.json(new ApiResponse(200, null, "Score deleted successfully"));
  }
);

// Score Calculation and Completion
export const calculateApplicationScore = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can calculate scores");
    }

    const { applicationId } = req.params;
    const calculation = await scoringService.calculateApplicationScore(
      parseInt(applicationId)
    );

    res.json(
      new ApiResponse(200, calculation, "Score calculated successfully")
    );
  }
);

export const completeApplicationScoring = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can complete scoring");
    }

    const { applicationId } = req.params;
    const application = await scoringService.completeApplicationScoring(
      parseInt(applicationId)
    );

    res.json(
      new ApiResponse(
        200,
        application,
        "Application scoring saved successfully"
      )
    );
  }
);

export const getApplicationScoresSummary = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { applicationId } = req.params;
    const appId = parseInt(applicationId);

    // Check access permissions
    if (req.user!.role === "APPLICANT") {
      // Applicants can only view their own application summaries
      const application = await prisma.application.findUnique({
        where: { id: appId },
        select: { applicantId: true },
      });

      if (!application || application.applicantId !== req.user!.id) {
        throw new ApiError(
          403,
          "You can only view your own application summary"
        );
      }
    }

    const summary = await scoringService.getApplicationScoresSummary(appId);

    res.json(
      new ApiResponse(
        200,
        summary,
        "Application scores summary retrieved successfully"
      )
    );
  }
);
