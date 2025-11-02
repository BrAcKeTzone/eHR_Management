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
  hrNotes?: string;
  totalScore?: number;
  result?: "PASS" | "FAIL";
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
        "You already have an active application. Please wait for the current application to be completed."
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
        ...data,
        applicantId: applicantId,
        attemptNumber,
        status: ApplicationStatus.PENDING,
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
          console.error("Failed to send submission notification:", error)
        );

      notificationService
        .sendNewApplicationAlertToHR(application, applicant)
        .catch((error) => console.error("Failed to send HR alert:", error));
    }

    return application;
  }

  async getApplicationById(
    id: number
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
    applicantId: number
  ): Promise<Application[]> {
    // Ensure applicantId is a number
    const id =
      typeof applicantId === "string" ? parseInt(applicantId) : applicantId;

    const applications = await prisma.application.findMany({
      where: { applicantId: id },
      orderBy: { attemptNumber: "desc" },
    });

    return applications.map((app: any) => formatApplicationForFrontend(app));
  }

  async getActiveApplicationByApplicant(
    applicantId: number
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
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ applications: ApplicationWithApplicant[]; total: number }> {
    const { status, result, search, page = 1, limit = 10 } = filters || {};

    const where: Prisma.ApplicationWhereInput = {
      ...(status && { status }),
      ...(result && { result }),
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
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    // Format applications for frontend
    const formattedApplications = applications.map(
      formatApplicationForFrontend
    );

    return { applications: formattedApplications, total };
  }

  async updateApplication(
    id: number,
    data: UpdateApplicationData
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
          console.error("Failed to send approval notification:", error)
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
          console.error("Failed to send rejection notification:", error)
        );
    }

    return application;
  }

  async scheduleDemo(
    id: number,
    demoSchedule: Date,
    demoLocation?: string,
    demoDuration?: number,
    demoNotes?: string
  ): Promise<Application> {
    const application = await prisma.application.findUnique({ where: { id } });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    if (application.status !== ApplicationStatus.APPROVED) {
      throw new ApiError(
        400,
        "Application must be approved before scheduling demo"
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
        }`
      );
    }

    const updatedApplication = await this.updateApplication(id, {
      demoSchedule,
      demoLocation,
      demoDuration,
      demoNotes,
    });

    // Get applicant details for notification
    const applicant = await prisma.user.findUnique({
      where: { id: application.applicantId },
    });

    if (applicant) {
      // Send demo schedule notification asynchronously
      notificationService
        .sendDemoScheduleNotification(updatedApplication, applicant)
        .catch((error) =>
          console.error("Failed to send demo schedule notification:", error)
        );
    }

    return updatedApplication;
  }

  async completeApplication(
    id: number,
    totalScore: number,
    result: "PASS" | "FAIL"
  ): Promise<Application> {
    return await this.updateApplication(id, {
      status: ApplicationStatus.COMPLETED,
      totalScore,
      result: result as any,
    });
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
