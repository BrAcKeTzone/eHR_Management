import { Request, Response } from "express";
import { ApplicationStatus } from "@prisma/client";
import applicationService from "./applications.service";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import asyncHandler from "../../utils/asyncHandler";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    email: string;
  };
}

export const createApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { program, documents } = req.body;
    const applicantId = req.user!.id;

    if (req.user!.role !== "APPLICANT") {
      throw new ApiError(403, "Only applicants can create applications");
    }

    const application = await applicationService.createApplication({
      program,
      documents,
      applicantId,
    });

    res
      .status(201)
      .json(
        new ApiResponse(201, application, "Application created successfully")
      );
  }
);

export const getMyApplications = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const applicantId = req.user!.id;

    if (req.user!.role !== "APPLICANT") {
      throw new ApiError(403, "Only applicants can view their applications");
    }

    const applications = await applicationService.getApplicationsByApplicant(
      applicantId
    );

    res.json(
      new ApiResponse(200, applications, "Applications retrieved successfully")
    );
  }
);

export const getMyActiveApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const applicantId = req.user!.id;

    if (req.user!.role !== "APPLICANT") {
      throw new ApiError(403, "Only applicants can view their applications");
    }

    const application =
      await applicationService.getActiveApplicationByApplicant(applicantId);

    res.json(
      new ApiResponse(
        200,
        application,
        "Active application retrieved successfully"
      )
    );
  }
);

export const getAllApplications = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can view all applications");
    }

    const { status, search, page, limit } = req.query;

    const filters = {
      ...(status && { status: status as ApplicationStatus }),
      ...(search && { search: search as string }),
      ...(page && { page: parseInt(page as string) }),
      ...(limit && { limit: parseInt(limit as string) }),
    };

    const result = await applicationService.getAllApplications(filters);

    res.json(
      new ApiResponse(200, result, "Applications retrieved successfully")
    );
  }
);

export const getApplicationById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const applicationId = parseInt(id);

    const application = await applicationService.getApplicationById(
      applicationId
    );

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    // Check access permissions
    if (
      req.user!.role === "APPLICANT" &&
      application.applicant.id !== req.user!.id
    ) {
      throw new ApiError(403, "You can only view your own applications");
    }

    res.json(
      new ApiResponse(200, application, "Application retrieved successfully")
    );
  }
);

export const approveApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can approve applications");
    }

    const { id } = req.params;
    const { hrNotes } = req.body;
    const applicationId = parseInt(id);

    const application = await applicationService.approveApplication(
      applicationId,
      hrNotes
    );

    res.json(
      new ApiResponse(200, application, "Application approved successfully")
    );
  }
);

export const rejectApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can reject applications");
    }

    const { id } = req.params;
    const { hrNotes } = req.body;
    const applicationId = parseInt(id);

    const application = await applicationService.rejectApplication(
      applicationId,
      hrNotes
    );

    res.json(
      new ApiResponse(200, application, "Application rejected successfully")
    );
  }
);

export const scheduleDemo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can schedule demos");
    }

    const { id } = req.params;
    const { demoSchedule } = req.body;
    const applicationId = parseInt(id);

    if (!demoSchedule) {
      throw new ApiError(400, "Demo schedule date is required");
    }

    const application = await applicationService.scheduleDemo(
      applicationId,
      new Date(demoSchedule)
    );

    res.json(new ApiResponse(200, application, "Demo scheduled successfully"));
  }
);

export const updateApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can update applications");
    }

    const { id } = req.params;
    const updateData = req.body;
    const applicationId = parseInt(id);

    const application = await applicationService.updateApplication(
      applicationId,
      updateData
    );

    res.json(
      new ApiResponse(200, application, "Application updated successfully")
    );
  }
);

export const deleteApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== "ADMIN") {
      throw new ApiError(403, "Only Admin can delete applications");
    }

    const { id } = req.params;
    const applicationId = parseInt(id);

    await applicationService.deleteApplication(applicationId);

    res.json(new ApiResponse(200, null, "Application deleted successfully"));
  }
);
