"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../configs/prisma"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const notifications_service_1 = __importDefault(require("../notifications/notifications.service"));
// Helper function to format application for frontend
function formatApplicationForFrontend(app) {
    let formattedApp = { ...app };
    // Format demoSchedule to include separate time string
    if (app.demoSchedule) {
        // Convert to local timezone and extract time
        const demoDate = new Date(app.demoSchedule);
        // Get local hours and minutes (this accounts for the timezone offset)
        const hours = demoDate.getHours().toString().padStart(2, "0");
        const minutes = demoDate.getMinutes().toString().padStart(2, "0");
        formattedApp.demoTime = `${hours}:${minutes}`;
    }
    return formattedApp;
}
class ApplicationService {
    async createApplication(data) {
        // Ensure applicantId is a number
        const applicantId = typeof data.applicantId === "string"
            ? parseInt(data.applicantId)
            : data.applicantId;
        if (!applicantId || isNaN(applicantId)) {
            throw new ApiError_1.default(400, "Invalid applicant ID");
        }
        // Check if user has an active application
        const existingApplication = await prisma_1.default.application.findFirst({
            where: {
                applicantId: applicantId,
                status: {
                    in: [client_1.ApplicationStatus.PENDING, client_1.ApplicationStatus.APPROVED],
                },
            },
        });
        if (existingApplication) {
            throw new ApiError_1.default(400, "You already have an active application. Please wait for the current application to be completed.");
        }
        // Get the next attempt number for this applicant
        const lastApplication = await prisma_1.default.application.findFirst({
            where: { applicantId: applicantId },
            orderBy: { attemptNumber: "desc" },
        });
        const attemptNumber = lastApplication
            ? lastApplication.attemptNumber + 1
            : 1;
        const application = await prisma_1.default.application.create({
            data: {
                ...data,
                applicantId: applicantId,
                attemptNumber,
                status: client_1.ApplicationStatus.PENDING,
            },
        });
        // Get applicant details for notifications
        const applicant = await prisma_1.default.user.findUnique({
            where: { id: applicantId },
        });
        if (applicant) {
            // Send notifications asynchronously
            notifications_service_1.default
                .sendApplicationSubmissionNotification(application, applicant)
                .catch((error) => console.error("Failed to send submission notification:", error));
            notifications_service_1.default
                .sendNewApplicationAlertToHR(application, applicant)
                .catch((error) => console.error("Failed to send HR alert:", error));
        }
        return application;
    }
    async getApplicationById(id) {
        const application = await prisma_1.default.application.findUnique({
            where: { id },
            include: {
                applicant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
        return application ? formatApplicationForFrontend(application) : null;
    }
    async getApplicationsByApplicant(applicantId) {
        // Ensure applicantId is a number
        const id = typeof applicantId === "string" ? parseInt(applicantId) : applicantId;
        const applications = await prisma_1.default.application.findMany({
            where: { applicantId: id },
            orderBy: { attemptNumber: "desc" },
        });
        return applications.map((app) => formatApplicationForFrontend(app));
    }
    async getActiveApplicationByApplicant(applicantId) {
        // Ensure applicantId is a number
        const id = typeof applicantId === "string" ? parseInt(applicantId) : applicantId;
        const application = await prisma_1.default.application.findFirst({
            where: {
                applicantId: id,
                status: {
                    in: [client_1.ApplicationStatus.PENDING, client_1.ApplicationStatus.APPROVED],
                },
            },
        });
        return application ? formatApplicationForFrontend(application) : null;
    }
    async getAllApplications(filters) {
        const { status, result, search, page = 1, limit = 10 } = filters || {};
        const where = {
            ...(status && { status }),
            ...(result && { result }),
            ...(search && {
                applicant: {
                    OR: [{ name: { contains: search } }, { email: { contains: search } }],
                },
            }),
        };
        const [applications, total] = await Promise.all([
            prisma_1.default.application.findMany({
                where,
                include: {
                    applicant: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.application.count({ where }),
        ]);
        // Format applications for frontend
        const formattedApplications = applications.map(formatApplicationForFrontend);
        return { applications: formattedApplications, total };
    }
    async updateApplication(id, data) {
        const application = await prisma_1.default.application.findUnique({ where: { id } });
        if (!application) {
            throw new ApiError_1.default(404, "Application not found");
        }
        return await prisma_1.default.application.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }
    async approveApplication(id, hrNotes) {
        const application = await this.updateApplication(id, {
            status: client_1.ApplicationStatus.APPROVED,
            hrNotes,
        });
        // Get applicant details for notification
        const applicant = await prisma_1.default.user.findUnique({
            where: { id: application.applicantId },
        });
        if (applicant) {
            // Send approval notification asynchronously
            notifications_service_1.default
                .sendApplicationApprovalNotification(application, applicant)
                .catch((error) => console.error("Failed to send approval notification:", error));
        }
        return application;
    }
    async rejectApplication(id, hrNotes) {
        const application = await this.updateApplication(id, {
            status: client_1.ApplicationStatus.REJECTED,
            hrNotes,
        });
        // Get applicant details for notification
        const applicant = await prisma_1.default.user.findUnique({
            where: { id: application.applicantId },
        });
        if (applicant) {
            // Send rejection notification asynchronously
            notifications_service_1.default
                .sendApplicationRejectionNotification(application, applicant)
                .catch((error) => console.error("Failed to send rejection notification:", error));
        }
        return application;
    }
    async scheduleDemo(id, demoSchedule, demoLocation, demoDuration, demoNotes) {
        const application = await prisma_1.default.application.findUnique({ where: { id } });
        if (!application) {
            throw new ApiError_1.default(404, "Application not found");
        }
        if (application.status !== client_1.ApplicationStatus.APPROVED) {
            throw new ApiError_1.default(400, "Application must be approved before scheduling demo");
        }
        const updatedApplication = await this.updateApplication(id, {
            demoSchedule,
            demoLocation,
            demoDuration,
            demoNotes,
        });
        // Get applicant details for notification
        const applicant = await prisma_1.default.user.findUnique({
            where: { id: application.applicantId },
        });
        if (applicant) {
            // Send demo schedule notification asynchronously
            notifications_service_1.default
                .sendDemoScheduleNotification(updatedApplication, applicant)
                .catch((error) => console.error("Failed to send demo schedule notification:", error));
        }
        return updatedApplication;
    }
    async completeApplication(id, totalScore, result) {
        return await this.updateApplication(id, {
            status: client_1.ApplicationStatus.COMPLETED,
            totalScore,
            result: result,
        });
    }
    async deleteApplication(id) {
        const application = await prisma_1.default.application.findUnique({ where: { id } });
        if (!application) {
            throw new ApiError_1.default(404, "Application not found");
        }
        await prisma_1.default.application.delete({ where: { id } });
    }
}
exports.default = new ApplicationService();
//# sourceMappingURL=applications.service.js.map