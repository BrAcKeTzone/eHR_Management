import { Request, Response } from "express";
import { ApplicationStatus, ApplicationResult } from "@prisma/client";
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
    console.log("=== Create Application Request ===");
    console.log("User:", req.user?.id, req.user?.role);
    console.log("Body keys:", Object.keys(req.body));
    console.log("Files received:", req.files ? (req.files as any[]).length : 0);

    const {
      program,
      documents: frontendDocuments,
      ...applicationData
    } = req.body;
    const applicantId = req.user!.id;

    if (req.user!.role !== "APPLICANT") {
      throw new ApiError(403, "Only applicants can create applications");
    }

    // Handle uploaded files from Cloudinary
    let documentsJson = "[]";
    if (req.files && Array.isArray(req.files)) {
      console.log("Processing", req.files.length, "files...");
      const documents = req.files.map((file: any) => {
        console.log("File object keys:", Object.keys(file));
        console.log("File details:", {
          originalname: file.originalname,
          filename: file.filename,
          public_id: file.public_id,
          secure_url: file.secure_url,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          format: file.format,
        });
        return {
          originalName: file.originalname,
          fileName: file.filename || file.public_id || file.originalname, // Fallback chain
          url: file.secure_url || file.path || file.url, // Cloudinary provides secure_url
          publicId: file.public_id || "", // Cloudinary public ID for future operations
          size: file.size || 0,
          mimetype: file.mimetype || "application/octet-stream",
          format: file.format || "",
          uploadedAt: new Date().toISOString(),
        };
      });
      documentsJson = JSON.stringify(documents);
      console.log("Documents JSON length:", documentsJson.length);
    }

    console.log("Creating application with program:", program);
    const application = await applicationService.createApplication({
      program: program || "Teaching Application",
      documents: documentsJson,
      applicantId,
      ...applicationData,
    });

    console.log("Application created successfully:", application.id);
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

    const { status, result: resultFilter, search, page, limit } = req.query;

    // Convert status and result to uppercase to match enums
    const normalizedStatus = status
      ? ((status as string).toUpperCase() as ApplicationStatus)
      : undefined;

    const normalizedResult = resultFilter
      ? ((resultFilter as string).toUpperCase() as ApplicationResult)
      : undefined;

    const filters = {
      ...(normalizedStatus && { status: normalizedStatus }),
      ...(normalizedResult && { result: normalizedResult }),
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
    const { demoSchedule, demoLocation, demoDuration, demoNotes } = req.body;
    const applicationId = parseInt(id);

    if (!demoSchedule) {
      throw new ApiError(400, "Demo schedule date is required");
    }

    const application = await applicationService.scheduleDemo(
      applicationId,
      new Date(demoSchedule),
      demoLocation,
      demoDuration ? parseInt(demoDuration) : undefined,
      demoNotes
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

export const completeApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can complete applications");
    }

    const { id } = req.params;
    const { totalScore, result, hrNotes } = req.body;
    const applicationId = parseInt(id);

    if (totalScore === undefined || totalScore === null) {
      throw new ApiError(400, "Total score is required");
    }

    if (!result || !["PASS", "FAIL"].includes(result.toUpperCase())) {
      throw new ApiError(400, "Valid result (PASS or FAIL) is required");
    }

    // Update application with score, result, and optional notes
    const updateData: any = {
      totalScore: parseFloat(totalScore),
      result: result.toUpperCase() as ApplicationResult,
      status: ApplicationStatus.COMPLETED,
    };

    if (hrNotes) {
      updateData.hrNotes = hrNotes;
    }

    const application = await applicationService.updateApplication(
      applicationId,
      updateData
    );

    res.json(
      new ApiResponse(200, application, "Application completed successfully")
    );
  }
);

export const getApplicationDocuments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const applicationId = parseInt(id);

    // Get the application with documents
    const application = await applicationService.getApplicationById(
      applicationId
    );

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    // Check authorization - applicants can only view their own, HR/Admin can view all
    if (
      req.user!.role === "APPLICANT" &&
      application.applicantId !== req.user!.id
    ) {
      throw new ApiError(
        403,
        "You can only view documents from your own applications"
      );
    }

    // Parse documents JSON
    let documents = [];
    try {
      if (application.documents) {
        documents = JSON.parse(application.documents);
      }
    } catch (error) {
      console.error("Error parsing documents:", error);
      documents = [];
    }

    res.json(
      new ApiResponse(
        200,
        { documents, applicationId: application.id },
        "Documents retrieved successfully"
      )
    );
  }
);

export const downloadDocument = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id, documentIndex } = req.params;
    const applicationId = parseInt(id);
    const docIndex = parseInt(documentIndex);

    // Get the application
    const application = await applicationService.getApplicationById(
      applicationId
    );

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    // Check authorization
    if (
      req.user!.role === "APPLICANT" &&
      application.applicantId !== req.user!.id
    ) {
      throw new ApiError(
        403,
        "You can only download documents from your own applications"
      );
    }

    // Parse documents
    let documents = [];
    try {
      if (application.documents) {
        documents = JSON.parse(application.documents);
      }
    } catch (error) {
      throw new ApiError(500, "Error parsing application documents");
    }

    // Check if document exists
    if (docIndex < 0 || docIndex >= documents.length) {
      throw new ApiError(404, "Document not found");
    }

    const document = documents[docIndex];

    // Redirect to Cloudinary URL
    // Cloudinary URLs are already public and accessible
    res.redirect(document.url);
  }
);
