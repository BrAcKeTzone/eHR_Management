import {
  Application,
  ApplicationStatus,
  ApplicationResult,
  User,
  Prisma,
} from "@prisma/client";
import prisma from "../../configs/prisma";
import ApiError from "../../utils/ApiError";
import notificationService from "../notifications/notifications.service";

export interface CreateApplicationData {
  program: string;
  documents?: string;
  applicantId: number;
  specializationId?: number;
  // Additional application fields from frontend
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  civilStatus?: string;
  nationality?: string;
  position?: string;
  subjectSpecialization?: string;
  educationalBackground?: string;
  teachingExperience?: string;
  motivation?: string;
}

export interface UpdateApplicationData {
  status?: ApplicationStatus;
  demoSchedule?: Date;
  demoLocation?: string;
  demoDuration?: number;
  demoNotes?: string;
  demoRescheduleCount?: number;
  hrNotes?: string;
  totalScore?: number;
  result?: "PASS" | "FAIL";
  interviewEligible?: boolean;
  interviewSchedule?: Date;
  interviewRescheduleCount?: number;
  interviewRescheduleReason?: string;
  interviewScore?: number;
  interviewResult?: "PASS" | "FAIL";
  interviewNotes?: string;
}

export interface ApplicationWithApplicant extends Application {
  applicant: Pick<User, "id" | "firstName" | "lastName" | "email" | "phone">;
}

// Helper function to format application for frontend
function formatApplicationForFrontend(app: any) {
  let formattedApp: any = { ...app };

  // Format demoSchedule to include separate time string in 12-hour format
  if (app.demoSchedule) {
    // Convert to local timezone and extract time
    const demoDate = new Date(app.demoSchedule);
    let hours = demoDate.getHours();
    const minutes = demoDate.getMinutes().toString().padStart(2, "0");

    // Convert to 12-hour format
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 to 12 for midnight, 13-23 to 1-11

    formattedApp.demoTime = `${hours}:${minutes} ${period}`;
  }

  if (app.interviewSchedule) {
    const interviewDate = new Date(app.interviewSchedule);
    let hours = interviewDate.getHours();
    const minutes = interviewDate.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    formattedApp.interviewTime = `${hours}:${minutes} ${period}`;
  }
  if ((app as any).interviewRescheduleCount !== undefined) {
    formattedApp.interviewRescheduleCount = (
      app as any
    ).interviewRescheduleCount;
  }
  if ((app as any).interviewRescheduleReason) {
    formattedApp.interviewRescheduleReason = (
      app as any
    ).interviewRescheduleReason;
  }

  return formattedApp;
}

class ApplicationService {
  async createApplication(data: CreateApplicationData): Promise<Application> {
    // Ensure applicantId is a number
    const applicantId =
      typeof data.applicantId === "string"
        ? parseInt(data.applicantId)
        : data.applicantId;

    if (!applicantId || isNaN(applicantId)) {
      throw new ApiError(400, "Invalid applicant ID");
    }

    // Check if user has an active application
    const existingApplication = await prisma.application.findFirst({
      where: {
        applicantId: applicantId,
        status: {
          in: [ApplicationStatus.PENDING, ApplicationStatus.APPROVED],
        },
      },
    });

    if (existingApplication) {
      throw new ApiError(
        400,
        "You already have an active application. Please wait for the current application to be completed.",
      );
    }

    // Get the next attempt number for this applicant
    const lastApplication = await prisma.application.findFirst({
      where: { applicantId: applicantId },
      orderBy: { attemptNumber: "desc" },
    });

    const attemptNumber = lastApplication
      ? lastApplication.attemptNumber + 1
      : 1;

    const application = await prisma.application.create({
      data: {
        documents: data.documents,
        applicantId: applicantId,
        specializationId: data.specializationId
          ? Number(data.specializationId)
          : undefined,
        attemptNumber,
        status: ApplicationStatus.PENDING,

        // Save additional fields
        program: data.program,
        subjectSpecialization: data.subjectSpecialization,
        educationalBackground: data.educationalBackground,
        teachingExperience: data.teachingExperience,
        motivation: data.motivation,
      },
      include: {
        specialization: true,
      },
    });

    // Get applicant details for notifications
    const applicant = await prisma.user.findUnique({
      where: { id: applicantId },
    });

    if (applicant) {
      // Send notifications asynchronously
      notificationService
        .sendApplicationSubmissionNotification(application, applicant)
        .catch((error) =>
          console.error("Failed to send submission notification:", error),
        );

      notificationService
        .sendNewApplicationAlertToHR(application, applicant)
        .catch((error) => console.error("Failed to send HR alert:", error));
    }

    return application;
  }

  async getApplicationById(
    id: number,
  ): Promise<ApplicationWithApplicant | null> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return application ? formatApplicationForFrontend(application) : null;
  }

  async getApplicationsByApplicant(
    applicantId: number,
  ): Promise<Application[]> {
    // Ensure applicantId is a number
    const id =
      typeof applicantId === "string" ? parseInt(applicantId) : applicantId;

    const applications = await prisma.application.findMany({
      where: { applicantId: id },
      orderBy: { attemptNumber: "desc" },
      include: {
        specialization: true,
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profilePicture: true,
          },
        },
      },
    });

    return applications.map((app: any) => formatApplicationForFrontend(app));
  }

  async getActiveApplicationByApplicant(
    applicantId: number,
  ): Promise<Application | null> {
    // Ensure applicantId is a number
    const id =
      typeof applicantId === "string" ? parseInt(applicantId) : applicantId;

    const application = await prisma.application.findFirst({
      where: {
        applicantId: id,
        status: {
          in: [ApplicationStatus.PENDING, ApplicationStatus.APPROVED],
        },
      },
    });

    return application ? formatApplicationForFrontend(application) : null;
  }

  async getAllApplications(filters?: {
    status?: ApplicationStatus;
    result?: ApplicationResult;
    interviewEligible?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ applications: ApplicationWithApplicant[]; total: number }> {
    const {
      status,
      result,
      interviewEligible,
      search,
      page = 1,
      limit = 10,
    } = filters || {};

    const where: Prisma.ApplicationWhereInput = {
      ...(status && { status }),
      ...(result && { result }),
      ...(typeof interviewEligible === "boolean" && { interviewEligible }),
      ...(search && {
        applicant: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
          ],
        },
      }),
    };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          specialization: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    // Format applications for frontend
    const formattedApplications = applications.map(
      formatApplicationForFrontend,
    );

    return { applications: formattedApplications, total };
  }

  async updateApplication(
    id: number,
    data: UpdateApplicationData,
  ): Promise<Application> {
    const application = await prisma.application.findUnique({ where: { id } });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    return await prisma.application.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async approveApplication(id: number, hrNotes?: string): Promise<Application> {
    const application = await this.updateApplication(id, {
      status: ApplicationStatus.APPROVED,
      hrNotes,
    });

    // Get applicant details for notification
    const applicant = await prisma.user.findUnique({
      where: { id: application.applicantId },
    });

    if (applicant) {
      // Send approval notification asynchronously
      notificationService
        .sendApplicationApprovalNotification(application, applicant)
        .catch((error) =>
          console.error("Failed to send approval notification:", error),
        );
    }

    return application;
  }

  async rejectApplication(id: number, hrNotes?: string): Promise<Application> {
    const application = await this.updateApplication(id, {
      status: ApplicationStatus.REJECTED,
      hrNotes,
    });

    // Get applicant details for notification
    const applicant = await prisma.user.findUnique({
      where: { id: application.applicantId },
    });

    if (applicant) {
      // Send rejection notification asynchronously
      notificationService
        .sendApplicationRejectionNotification(application, applicant)
        .catch((error) =>
          console.error("Failed to send rejection notification:", error),
        );
    }

    return application;
  }

  async scheduleDemo(
    id: number,
    demoSchedule: Date,
    demoLocation?: string,
    demoDuration?: number,
    demoNotes?: string,
    rescheduleReason?: string,
  ): Promise<Application> {
    const application = await prisma.application.findUnique({ where: { id } });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    if (application.status !== ApplicationStatus.APPROVED) {
      throw new ApiError(
        400,
        "Application must be approved before scheduling demo",
      );
    }

    // Validate demo date is at least 1 day in the future
    const demoDate = new Date(demoSchedule);
    const today = new Date();
    // Set time to start of day for comparison
    today.setHours(0, 0, 0, 0);
    demoDate.setHours(0, 0, 0, 0);

    // Calculate the difference in days
    const timeDifference = demoDate.getTime() - today.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    if (daysDifference < 1) {
      throw new ApiError(
        400,
        `Demo date must be at least 1 day in the future. Please select a date starting from ${
          new Date(today.getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        }`,
      );
    }

    // Enforce demo duration to 60 minutes
    const enforcedDuration = 60;

    // Determine whether this is an initial schedule or a reschedule
    const isReschedule = !!application.demoSchedule;

    // Prevent scheduling/rescheduling if a demo result already exists (i.e., scored and finalized).
    // Having a raw totalScore without a result should not prevent re-scheduling.
    if ((application as any).result) {
      throw new ApiError(
        400,
        "Cannot schedule or reschedule demo for an application that already has a demo result",
      );
    }
    const currentRescheduleCount = application.demoRescheduleCount || 0;

    // If attempting to reschedule and reschedule count already reached 1, prevent further reschedules
    if (isReschedule && currentRescheduleCount >= 1) {
      throw new ApiError(
        400,
        "This application has already been rescheduled once and cannot be rescheduled again.",
      );
    }

    const updateData: any = {
      demoSchedule,
      demoLocation,
      demoDuration: enforcedDuration,
      demoNotes,
    };

    if (isReschedule) {
      updateData.demoRescheduleCount = currentRescheduleCount + 1;
      // Save reschedule reason if present
      if (rescheduleReason) {
        updateData.demoRescheduleReason = rescheduleReason;
      }
    }

    const updatedApplication = await this.updateApplication(id, updateData);

    // Get applicant details for notification
    const applicant = await prisma.user.findUnique({
      where: { id: application.applicantId },
    });

    if (applicant) {
      // If this is a reschedule send a specific reschedule notification
      if (isReschedule) {
        notificationService
          .sendDemoRescheduleNotification(
            updatedApplication,
            applicant,
            rescheduleReason,
          )
          .catch((error) =>
            console.error(
              "Failed to send demo reschedule notification:",
              error,
            ),
          );
      } else {
        // Send initial demo schedule notification asynchronously
        notificationService
          .sendDemoScheduleNotification(updatedApplication, applicant)
          .catch((error) =>
            console.error("Failed to send demo schedule notification:", error),
          );
      }
    }

    return updatedApplication;
  }

  async scheduleInterview(
    id: number,
    interviewSchedule: Date,
    rescheduleReason?: string,
  ): Promise<Application> {
    const application = await prisma.application.findUnique({ where: { id } });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    // Prevent scheduling/rescheduling if interview result already exists
    if ((application as any).interviewResult) {
      throw new ApiError(
        400,
        "Cannot schedule or reschedule interview for an application that already has an interview result",
      );
    }

    // Require application to be interviewEligible or have passing score
    const appAny = application as any;
    const eligible =
      appAny.interviewEligible ||
      (typeof application.totalScore === "number" &&
        application.totalScore >= 75);
    if (!eligible) {
      throw new ApiError(
        400,
        "Application is not eligible for interview scheduling",
      );
    }

    const interviewDate = new Date(interviewSchedule);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    interviewDate.setHours(0, 0, 0, 0);

    const timeDifference = interviewDate.getTime() - today.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    if (daysDifference < 1) {
      throw new ApiError(
        400,
        "Interview date must be at least 1 day in the future",
      );
    }

    // If a demo is scheduled, interview date must be on/after demo date (date-only)
    if (application.demoSchedule) {
      const demoDate = new Date(application.demoSchedule as any);
      demoDate.setHours(0, 0, 0, 0);
      if (interviewDate.getTime() < demoDate.getTime()) {
        throw new ApiError(
          400,
          "Interview date must be on or after the demo schedule date",
        );
      }
    }

    // Check reschedule limits - only allow 1 reschedule
    const isReschedule = !!(application as any).interviewSchedule;
    // If rescheduling, require a reason similar to demo schedule
    if (isReschedule) {
      if (!rescheduleReason) {
        throw new ApiError(
          400,
          "Reschedule reason is required when updating an existing interview schedule",
        );
      }
      const allowedReasons = ["APPLICANT_NO_SHOW", "SCHOOL"];
      if (!allowedReasons.includes(rescheduleReason)) {
        throw new ApiError(
          400,
          `Invalid reschedule reason. Allowed: ${allowedReasons.join(", ")}`,
        );
      }
    }
    const currentRescheduleCount =
      (application as any).interviewRescheduleCount || 0;
    if (isReschedule && currentRescheduleCount >= 1) {
      throw new ApiError(
        400,
        "This application has already been rescheduled once and cannot be rescheduled again.",
      );
    }

    const updateData: any = { interviewSchedule };
    if (isReschedule) {
      updateData.interviewRescheduleCount = currentRescheduleCount + 1;
      updateData.interviewRescheduleReason = rescheduleReason;
    }

    const updatedApplication = await this.updateApplication(id, updateData);

    // Notify applicant about interview schedule
    const applicant = await prisma.user.findUnique({
      where: { id: updatedApplication.applicantId },
    });
    if (applicant) {
      notificationService
        .sendInterviewScheduleNotification(updatedApplication, applicant)
        .catch((err: any) =>
          console.error("Failed to send interview schedule notification:", err),
        );
    }

    return updatedApplication;
  }

  async completeApplication(
    id: number,
    scores: {
      studentLearningActionsScore: number;
      knowledgeOfSubjectScore: number;
      teachingMethodScore: number;
      instructorAttributesScore: number;
    },
    hrNotes?: string,
  ): Promise<Application> {
    const {
      studentLearningActionsScore,
      knowledgeOfSubjectScore,
      teachingMethodScore,
      instructorAttributesScore,
    } = scores;

    const totalScore =
      studentLearningActionsScore +
      knowledgeOfSubjectScore +
      teachingMethodScore +
      instructorAttributesScore;

    // Pass when total score >= 75
    const result: ApplicationResult = totalScore >= 75 ? "PASS" : "FAIL";

    const updateData: any = {
      studentLearningActionsScore,
      knowledgeOfSubjectScore,
      teachingMethodScore,
      instructorAttributesScore,
      totalScore,
      result,
      interviewEligible: totalScore >= 75,
    };

    if (hrNotes) {
      updateData.hrNotes = hrNotes;
    }

    // If demo failed, mark the application as REJECTED
    if (result === "FAIL") {
      updateData.status = ApplicationStatus.REJECTED;
    }

    return await this.updateApplication(id, updateData);
  }

  async rateInterview(
    id: number,
    interviewScore: number | null,
    interviewResult: "PASS" | "FAIL",
    interviewNotes?: string,
  ): Promise<Application> {
    const application = await prisma.application.findUnique({ where: { id } });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    if (!application.interviewSchedule) {
      throw new ApiError(
        400,
        "Application must have a scheduled interview before rating",
      );
    }

    // Validate score range if provided
    if (
      interviewScore !== null &&
      (interviewScore < 0 || interviewScore > 100)
    ) {
      throw new ApiError(400, "Interview score must be between 0 and 100");
    }

    const updateData: any = {
      ...(interviewScore !== null && { interviewScore }),
      interviewResult: interviewResult as any,
      interviewNotes,
    };

    // If interview is PASS, mark status as COMPLETED; if FAIL, mark as REJECTED
    if (
      interviewResult &&
      ["PASS", "FAIL"].includes(interviewResult.toUpperCase())
    ) {
      if (interviewResult.toUpperCase() === "PASS") {
        updateData.status = ApplicationStatus.COMPLETED;
      } else if (interviewResult.toUpperCase() === "FAIL") {
        updateData.status = ApplicationStatus.REJECTED;
      }
    }

    const updatedApplication = await this.updateApplication(id, updateData);

    // Note: Interview result notification can be added when notification service is extended
    // For now, the interview rating is saved successfully

    return updatedApplication;
  }

  async deleteApplication(id: number): Promise<void> {
    const application = await prisma.application.findUnique({ where: { id } });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    await prisma.application.delete({ where: { id } });
  }
}

export default new ApplicationService();
