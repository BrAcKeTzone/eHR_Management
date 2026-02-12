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

// Helper function to append .pdf to Cloudinary URLs if missing and it's a PDF document
const ensurePdfExtension = (url: string | null) => {
  if (!url || typeof url !== "string") return url;
  if (
    url.includes("cloudinary.com") &&
    !url.toLowerCase().endsWith(".pdf") &&
    !url.toLowerCase().endsWith(".png") &&
    !url.toLowerCase().endsWith(".jpg") &&
    !url.toLowerCase().endsWith(".jpeg")
  ) {
    return `${url}.pdf`;
  }
  return url;
};

// Helper function to process application documents JSON
const processApplicationDocuments = (application: any) => {
  if (!application || !application.documents) return application;
  try {
    const documents = JSON.parse(application.documents);
    if (Array.isArray(documents)) {
      const processed = documents.map((doc: any) => {
        if (doc.url) {
          doc.url = ensurePdfExtension(doc.url);
        }
        return doc;
      });
      application.documents = JSON.stringify(processed);
    }
  } catch (e) {
    console.error("Error processing application documents for retrieval:", e);
  }
  return application;
};

export const createApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    console.log("=== Create Application Request ===");
    console.log("User:", req.user?.id, req.user?.role);
    console.log("Body keys:", Object.keys(req.body));
    console.log("Files received:", req.files ? (req.files as any[]).length : 0);

    const {
      program,
      documents: frontendDocuments,
      documentTypes,
      applicantFirstName,
      applicantLastName,
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

    const application = await applicationService.createApplication({
      documents: documentsJson,
      applicantId,
      ...applicationData,
    });

    console.log("Application created successfully:", application.id);
    res
      .status(201)
      .json(
        new ApiResponse(201, application, "Application created successfully"),
      );
  },
);

export const getMyApplications = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const applicantId = req.user!.id;

    if (req.user!.role !== "APPLICANT") {
      throw new ApiError(403, "Only applicants can view their applications");
    }

    const applications =
      await applicationService.getApplicationsByApplicant(applicantId);

    // Process documents to ensure .pdf extension for retrieval
    const processedApplications = applications.map((app) =>
      processApplicationDocuments(app),
    );

    res.json(
      new ApiResponse(
        200,
        processedApplications,
        "Applications retrieved successfully",
      ),
    );
  },
);

export const getMyActiveApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const applicantId = req.user!.id;

    if (req.user!.role !== "APPLICANT") {
      throw new ApiError(403, "Only applicants can view their applications");
    }

    const application =
      await applicationService.getActiveApplicationByApplicant(applicantId);

    // Process documents for retrieval
    const processedApplication = processApplicationDocuments(application);

    res.json(
      new ApiResponse(
        200,
        processedApplication,
        "Active application retrieved successfully",
      ),
    );
  },
);

export const getAllApplications = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can view all applications");
    }

    const {
      status,
      result: resultFilter,
      interviewEligible,
      search,
      page,
      limit,
    } = req.query;

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
      ...(typeof interviewEligible !== "undefined" && {
        interviewEligible: interviewEligible === "true",
      }),
      ...(search && { search: search as string }),
      ...(page && { page: parseInt(page as string) }),
      ...(limit && { limit: parseInt(limit as string) }),
    };

    const result = await applicationService.getAllApplications(filters);

    // Process documents for all applications
    if (result.applications) {
      result.applications = result.applications.map((app: any) =>
        processApplicationDocuments(app),
      );
    }

    res.json(
      new ApiResponse(200, result, "Applications retrieved successfully"),
    );
  },
);

export const getApplicationById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const applicationId = parseInt(id);

    const application =
      await applicationService.getApplicationById(applicationId);

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    // Process documents for retrieval
    const processedApplication = processApplicationDocuments(application);

    // Check access permissions
    if (
      req.user!.role === "APPLICANT" &&
      processedApplication.applicant.id !== req.user!.id
    ) {
      throw new ApiError(403, "You can only view your own applications");
    }

    res.json(
      new ApiResponse(
        200,
        processedApplication,
        "Application retrieved successfully",
      ),
    );
  },
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
      hrNotes,
    );

    res.json(
      new ApiResponse(200, application, "Application approved successfully"),
    );
  },
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
      hrNotes,
    );

    res.json(
      new ApiResponse(200, application, "Application rejected successfully"),
    );
  },
);

export const scheduleDemo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can schedule demos");
    }

    const { id } = req.params;
    const {
      demoSchedule,
      demoLocation,
      demoDuration,
      demoNotes,
      rescheduleReason,
    } = req.body;
    const applicationId = parseInt(id);

    if (!demoSchedule) {
      throw new ApiError(400, "Demo schedule date is required");
    }

    // Determine if this is a reschedule so we can validate the input
    const existingApp =
      await applicationService.getApplicationById(applicationId);
    const isReschedule = existingApp?.demoSchedule;

    if (isReschedule && !rescheduleReason) {
      throw new ApiError(
        400,
        "Reschedule reason is required when updating an existing demo schedule",
      );
    }

    // If rescheduleReason is provided, validate allowed values
    const allowedReasons = ["APPLICANT_NO_SHOW", "SCHOOL"];
    if (rescheduleReason && !allowedReasons.includes(rescheduleReason)) {
      throw new ApiError(
        400,
        `Invalid reschedule reason. Allowed: ${allowedReasons.join(", ")}`,
      );
    }

    const application = await applicationService.scheduleDemo(
      applicationId,
      new Date(demoSchedule),
      demoLocation,
      demoDuration ? parseInt(demoDuration) : undefined,
      demoNotes,
      rescheduleReason,
    );

    res.json(new ApiResponse(200, application, "Demo scheduled successfully"));
  },
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
      updateData,
    );

    res.json(
      new ApiResponse(200, application, "Application updated successfully"),
    );
  },
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
  },
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
    };

    if (hrNotes) {
      updateData.hrNotes = hrNotes;
    }
    // mark the application as interviewEligible if score is >= 75
    const numericScore = parseFloat(totalScore);
    if (!isNaN(numericScore)) {
      updateData.interviewEligible = numericScore >= 75;
    }

    // If demo result is FAIL, mark the application as REJECTED. If PASS, keep the application in its current status (e.g., APPROVED), so it can be scheduled for interview.
    if ((result || "").toUpperCase() === "FAIL") {
      updateData.status = ApplicationStatus.REJECTED;
    }

    const application = await applicationService.updateApplication(
      applicationId,
      updateData,
    );

    res.json(
      new ApiResponse(
        200,
        application,
        "Application scoring saved successfully",
      ),
    );
  },
);

export const rateInterview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can rate interviews");
    }

    const { id } = req.params;
    const { interviewScore, interviewResult, interviewNotes } = req.body;
    const applicationId = parseInt(id);

    if (
      !interviewResult ||
      !["PASS", "FAIL"].includes(interviewResult.toUpperCase())
    ) {
      throw new ApiError(400, "Valid result (PASS or FAIL) is required");
    }

    const application = await applicationService.rateInterview(
      applicationId,
      interviewScore ? parseFloat(interviewScore) : null,
      interviewResult.toUpperCase() as "PASS" | "FAIL",
      interviewNotes,
    );

    // Get the full application with applicant details and format it
    const formattedApplication =
      await applicationService.getApplicationById(applicationId);

    res.json(
      new ApiResponse(
        200,
        formattedApplication,
        "Interview rated successfully",
      ),
    );
  },
);

export const getApplicationDocuments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const applicationId = parseInt(id);

    // Get the application with documents
    const application =
      await applicationService.getApplicationById(applicationId);

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
        "You can only view documents from your own applications",
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
        "Documents retrieved successfully",
      ),
    );
  },
);

export const scheduleInterview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can schedule interviews");
    }

    const { id } = req.params;
    const { interviewSchedule, rescheduleReason } = req.body;
    const applicationId = parseInt(id);

    if (!interviewSchedule) {
      throw new ApiError(400, "Interview schedule date is required");
    }

    const application = await applicationService.scheduleInterview(
      applicationId,
      new Date(interviewSchedule),
      rescheduleReason,
    );

    // Get the full application with applicant details and format it
    const formattedApplication =
      await applicationService.getApplicationById(applicationId);

    res.json(
      new ApiResponse(
        200,
        formattedApplication,
        "Interview scheduled successfully",
      ),
    );
  },
);

export const downloadDocument = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id, documentIndex } = req.params;
    const applicationId = parseInt(id);
    const docIndex = parseInt(documentIndex);

    // Get the application
    const application =
      await applicationService.getApplicationById(applicationId);

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
        "You can only download documents from your own applications",
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
  },
);
