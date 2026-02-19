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
    const appendInterviewTime = (dateVal, key) => {
        if (!dateVal)
            return;
        const interviewDate = new Date(dateVal);
        let hours = interviewDate.getHours();
        const minutes = interviewDate.getMinutes().toString().padStart(2, "0");
        const period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        formattedApp[key] = `${hours}:${minutes} ${period}`;
    };
    appendInterviewTime(app.initialInterviewSchedule, "initialInterviewTime");
    appendInterviewTime(app.finalInterviewSchedule, "finalInterviewTime");
    formattedApp.initialInterviewRescheduleCount =
        app.initialInterviewRescheduleCount || 0;
    formattedApp.initialInterviewRescheduleReason = app.initialInterviewRescheduleReason;
    formattedApp.finalInterviewRescheduleCount =
        app.finalInterviewRescheduleCount || 0;
    formattedApp.finalInterviewRescheduleReason = app.finalInterviewRescheduleReason;
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
                documents: data.documents,
                applicantId: applicantId,
                specializationId: data.specializationId
                    ? Number(data.specializationId)
                    : undefined,
                attemptNumber,
                status: client_1.ApplicationStatus.PENDING,
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
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        profilePicture: true,
                        civilStatus: true,
                        houseNo: true,
                        street: true,
                        barangay: true,
                        city: true,
                        province: true,
                        zipCode: true,
                        education: true,
                        references: true,
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
                        civilStatus: true,
                        houseNo: true,
                        street: true,
                        barangay: true,
                        city: true,
                        province: true,
                        zipCode: true,
                        education: true,
                        references: true,
                    },
                },
            },
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
        const { status, result, finalInterviewResult, interviewEligible, search, page = 1, limit = 10, } = filters || {};
        const where = {
            ...(status && { status }),
            ...(result && { result }),
            ...(finalInterviewResult && { finalInterviewResult }),
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
        // For finalInterviewResult filter, get the latest application per applicant
        let applicationIds;
        if (finalInterviewResult) {
            // Get the LATEST application ID for EACH applicant with finalInterviewResult = PASS
            const allAppsWithResult = await prisma_1.default.application.findMany({
                where: { finalInterviewResult },
                select: {
                    id: true,
                    applicantId: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            });
            // Group by applicantId and take the first (latest) one for each
            const latestPerApplicant = new Map();
            allAppsWithResult.forEach((app) => {
                if (!latestPerApplicant.has(app.applicantId)) {
                    latestPerApplicant.set(app.applicantId, app.id);
                }
            });
            applicationIds = Array.from(latestPerApplicant.values());
            console.log("Latest applications per applicant with finalInterviewResult = PASS:", applicationIds);
        }
        const finalWhere = {
            ...where,
            ...(applicationIds && { id: { in: applicationIds } }),
        };
        const [applications, total] = await Promise.all([
            prisma_1.default.application.findMany({
                where: finalWhere,
                include: {
                    applicant: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            profilePicture: true,
                            civilStatus: true,
                            houseNo: true,
                            street: true,
                            barangay: true,
                            city: true,
                            province: true,
                            zipCode: true,
                            education: true,
                            references: true,
                        },
                    },
                    specialization: true,
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.application.count({ where: finalWhere }),
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
            include: {
                specialization: true,
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
    async scheduleDemo(id, demoSchedule, demoLocation, demoDuration, demoNotes, rescheduleReason) {
        const application = await prisma_1.default.application.findUnique({ where: { id } });
        if (!application) {
            throw new ApiError_1.default(404, "Application not found");
        }
        if (application.status !== client_1.ApplicationStatus.APPROVED) {
            throw new ApiError_1.default(400, "Application must be approved before scheduling demo");
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
            throw new ApiError_1.default(400, `Demo date must be at least 1 day in the future. Please select a date starting from ${new Date(today.getTime() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]}`);
        }
        // Enforce demo duration to 60 minutes
        const enforcedDuration = 60;
        // Determine whether this is an initial schedule or a reschedule
        const isReschedule = !!application.demoSchedule;
        // Prevent scheduling/rescheduling if a demo result already exists (i.e., scored and finalized).
        // Having a raw totalScore without a result should not prevent re-scheduling.
        if (application.result) {
            throw new ApiError_1.default(400, "Cannot schedule or reschedule demo for an application that already has a demo result");
        }
        const currentRescheduleCount = application.demoRescheduleCount || 0;
        // If attempting to reschedule and reschedule count already reached 1, prevent further reschedules
        if (isReschedule && currentRescheduleCount >= 1) {
            throw new ApiError_1.default(400, "This application has already been rescheduled once and cannot be rescheduled again.");
        }
        const updateData = {
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
        const applicant = await prisma_1.default.user.findUnique({
            where: { id: application.applicantId },
        });
        if (applicant) {
            // If this is a reschedule send a specific reschedule notification
            if (isReschedule) {
                notifications_service_1.default
                    .sendDemoRescheduleNotification(updatedApplication, applicant, rescheduleReason)
                    .catch((error) => console.error("Failed to send demo reschedule notification:", error));
            }
            else {
                // Send initial demo schedule notification asynchronously
                notifications_service_1.default
                    .sendDemoScheduleNotification(updatedApplication, applicant)
                    .catch((error) => console.error("Failed to send demo schedule notification:", error));
            }
        }
        return updatedApplication;
    }
    async scheduleInterview(id, interviewSchedule, rescheduleReason, stage = "initial") {
        const application = await prisma_1.default.application.findUnique({ where: { id } });
        if (!application) {
            throw new ApiError_1.default(404, "Application not found");
        }
        const hasFinalResult = application.interviewResult;
        if (hasFinalResult && stage === "final") {
            throw new ApiError_1.default(400, "Cannot schedule or reschedule final interview for an application that already has a final interview result");
        }
        // Require application to be interviewEligible or have passing score
        const appAny = application;
        const eligible = appAny.interviewEligible ||
            (typeof application.totalScore === "number" &&
                application.totalScore >= 75);
        if (!eligible) {
            throw new ApiError_1.default(400, "Application is not eligible for interview scheduling");
        }
        // Final interview requires a passed initial interview result
        if (stage === "final" &&
            application.initialInterviewResult !== "PASS") {
            throw new ApiError_1.default(400, "Final interview can only be scheduled after a PASS initial interview result");
        }
        const interviewDate = new Date(interviewSchedule);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        interviewDate.setHours(0, 0, 0, 0);
        const timeDifference = interviewDate.getTime() - today.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        if (daysDifference < 1) {
            throw new ApiError_1.default(400, "Interview date must be at least 1 day in the future");
        }
        // If a demo is scheduled, interview date must be on/after demo date (date-only)
        if (application.demoSchedule) {
            const demoDate = new Date(application.demoSchedule);
            demoDate.setHours(0, 0, 0, 0);
            if (interviewDate.getTime() < demoDate.getTime()) {
                throw new ApiError_1.default(400, "Interview date must be on or after the demo schedule date");
            }
        }
        const currentScheduleField = stage === "final" ? "finalInterviewSchedule" : "initialInterviewSchedule";
        const rescheduleCountField = stage === "final"
            ? "finalInterviewRescheduleCount"
            : "initialInterviewRescheduleCount";
        const rescheduleReasonField = stage === "final"
            ? "finalInterviewRescheduleReason"
            : "initialInterviewRescheduleReason";
        // Check reschedule limits - only allow 1 reschedule per stage
        const isReschedule = !!application[currentScheduleField];
        // If rescheduling, require a reason similar to demo schedule
        if (isReschedule) {
            if (!rescheduleReason) {
                throw new ApiError_1.default(400, "Reschedule reason is required when updating an existing interview schedule");
            }
            const allowedReasons = ["APPLICANT_NO_SHOW", "SCHOOL"];
            if (!allowedReasons.includes(rescheduleReason)) {
                throw new ApiError_1.default(400, `Invalid reschedule reason. Allowed: ${allowedReasons.join(", ")}`);
            }
        }
        const currentRescheduleCount = application[rescheduleCountField] || 0;
        if (isReschedule && currentRescheduleCount >= 1) {
            throw new ApiError_1.default(400, "This application has already been rescheduled once and cannot be rescheduled again.");
        }
        const updateData = {};
        updateData[currentScheduleField] = interviewSchedule;
        if (isReschedule) {
            updateData[rescheduleCountField] = currentRescheduleCount + 1;
            updateData[rescheduleReasonField] = rescheduleReason;
        }
        const updatedApplication = await this.updateApplication(id, updateData);
        // Notify applicant about interview schedule
        const applicant = await prisma_1.default.user.findUnique({
            where: { id: updatedApplication.applicantId },
        });
        if (applicant) {
            notifications_service_1.default
                .sendInterviewScheduleNotification(updatedApplication, applicant, stage)
                .catch((err) => console.error("Failed to send interview schedule notification:", err));
        }
        return updatedApplication;
    }
    async completeApplication(id, scores, hrNotes, demoFeedback) {
        const { studentLearningActionsScore, knowledgeOfSubjectScore, teachingMethodScore, instructorAttributesScore, } = scores;
        const totalScore = studentLearningActionsScore +
            knowledgeOfSubjectScore +
            teachingMethodScore +
            instructorAttributesScore;
        // Pass when total score >= 75
        const result = totalScore >= 75 ? "PASS" : "FAIL";
        const updateData = {
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
        if (demoFeedback) {
            updateData.demoFeedback = demoFeedback;
        }
        // If demo failed, mark the application as REJECTED
        if (result === "FAIL") {
            updateData.status = client_1.ApplicationStatus.REJECTED;
        }
        return await this.updateApplication(id, updateData);
    }
    async rateInterview(id, interviewScore, interviewResult, interviewNotes, stage = "initial") {
        const application = await prisma_1.default.application.findUnique({ where: { id } });
        if (!application) {
            throw new ApiError_1.default(404, "Application not found");
        }
        const scheduledField = stage === "final" ? "finalInterviewSchedule" : "initialInterviewSchedule";
        if (!application[scheduledField]) {
            throw new ApiError_1.default(400, "Application must have a scheduled interview before rating");
        }
        // Validate score range if provided
        if (interviewScore !== null &&
            (interviewScore < 0 || interviewScore > 100)) {
            throw new ApiError_1.default(400, "Interview score must be between 0 and 100");
        }
        const updateData = {};
        if (stage === "final") {
            if (interviewScore !== null) {
                updateData.interviewScore = interviewScore;
            }
            updateData.interviewResult = interviewResult;
            updateData.interviewNotes = interviewNotes;
            updateData.finalInterviewResult = interviewResult;
            updateData.finalInterviewFeedback = interviewNotes;
        }
        else {
            updateData.initialInterviewResult = interviewResult;
            updateData.initialInterviewFeedback = interviewNotes;
        }
        if (stage === "final") {
            if (interviewResult === "PASS") {
                updateData.status = client_1.ApplicationStatus.COMPLETED;
            }
            else {
                updateData.status = client_1.ApplicationStatus.REJECTED;
            }
        }
        const updatedApplication = await this.updateApplication(id, updateData);
        if (stage === "final" && interviewResult === "PASS") {
            const applicant = await prisma_1.default.user.findUnique({
                where: { id: updatedApplication.applicantId },
            });
            if (applicant) {
                await notifications_service_1.default.sendFinalInterviewPassedNotification(updatedApplication, applicant);
            }
        }
        return updatedApplication;
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