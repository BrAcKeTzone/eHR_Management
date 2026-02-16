import {
  Application,
  User,
  ApplicationStatus,
  ApplicationResult,
} from "@prisma/client";
import sendEmail from "../../utils/email";
import prisma from "../../configs/prisma";

export interface NotificationData {
  email: string;
  subject: string;
  message: string;
  type:
    | "submission"
    | "approval"
    | "rejection"
    | "schedule"
    | "reschedule"
    | "result"
    | "hr_alert";
  applicationId?: number;
}

class NotificationService {
  // Helper to return applicant's full name
  private getApplicantFullName(applicant: User) {
    return `${applicant.firstName} ${applicant.lastName || ""}`.trim();
  }

  // Helper to return a program/name value for the application if present
  private getApplicationProgram(application: any) {
    return (
      application?.specialization?.name ||
      application?.program ||
      application?.position ||
      application?.subjectSpecialization ||
      ""
    );
  }
  // Save notification to database for audit trail
  private async saveNotification(data: NotificationData): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          email: data.email,
          subject: data.subject,
          message: data.message,
          type: data.type,
          applicationId: data.applicationId,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to save notification to database:", error);
    }
  }

  // Send email and save to database
  private async sendAndSaveNotification(
    data: NotificationData,
    notificationMessage?: string,
  ): Promise<void> {
    try {
      await sendEmail({
        email: data.email,
        subject: data.subject,
        message: data.message,
      });

      await this.saveNotification({
        ...data,
        message: notificationMessage || data.message,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
      throw error;
    }
  }

  // Application submission confirmation to applicant
  async sendApplicationSubmissionNotification(
    application: Application,
    applicant: User,
  ): Promise<void> {
    const subject =
      "Application Submitted Successfully - BCFI Teacher Application";
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);
    const message = `
Dear ${applicantFullName},

Thank you for submitting your teacher application for the ${programName} specialization at Blancia College Foundation Inc.

Application Details:
- Application ID: ${application.id}
- Attempt Number: ${application.attemptNumber}
- Specialization: ${programName}
- Submission Date: ${application.createdAt.toLocaleDateString()}
- Status: Pending Review

Your application is now under review by our HR team. You will receive email updates as your application progresses through our review process.

You can track your application status by logging into your account on our application portal.

If you have any questions, please don't hesitate to contact our HR department.

Best regards,
BCFI HR Team
Blancia College Foundation Inc.
    `;

    await this.sendAndSaveNotification({
      email: applicant.email,
      subject,
      message,
      type: "submission",
      applicationId: application.id,
    });
  }

  // New application alert to HR
  async sendNewApplicationAlertToHR(
    application: Application,
    applicant: User,
  ): Promise<void> {
    const hrEmails = await this.getHREmails();

    const subject = "New Teacher Application Submitted - Action Required";
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);
    const message = `
  A new teacher application has been submitted and requires your review.

  Applicant Details:
  - Name: ${applicantFullName}
  - Email: ${applicant.email}
  - Phone: ${applicant.phone || "Not provided"}

  Application Details:
  - Application ID: ${application.id}
  - Attempt Number: ${application.attemptNumber}
  - Specialization: ${programName}
  - Submission Date: ${application.createdAt.toLocaleDateString()}

  Please log into the HR portal to review this application and take appropriate action.

  Best regards,
  BCFI Application System
    `;

    // Send to all HR users
    for (const email of hrEmails) {
      await this.sendAndSaveNotification({
        email,
        subject,
        message,
        type: "hr_alert",
        applicationId: application.id,
      });
    }
  }

  // Application approval notification
  async sendApplicationApprovalNotification(
    application: Application,
    applicant: User,
  ): Promise<void> {
    const subject = "Application Approved - Teaching Demo Scheduling - BCFI";
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);
    const message = `
  Dear ${applicantFullName},

  Congratulations! Your teacher application for the ${programName} specialization has been approved.

Application Details:
- Application ID: ${application.id}
- Specialization: ${programName}
- Approval Date: ${new Date().toLocaleDateString()}

Next Steps:
You will be notified on your account regarding the schedule of your teaching demonstration. Please ensure you're available for the demo as this is a crucial part of our evaluation process.

${application.hrNotes ? `\nHR Notes: ${application.hrNotes}` : ""}

You can view your application status and demo schedule by logging into your account.

Congratulations again, and we look forward to your teaching demonstration!

Best regards,
BCFI HR Team
Blancia College Foundation Inc.
    `;

    await this.sendAndSaveNotification({
      email: applicant.email,
      subject,
      message,
      type: "approval",
      applicationId: application.id,
    });
  }

  // Application rejection notification
  async sendApplicationRejectionNotification(
    application: Application,
    applicant: User,
  ): Promise<void> {
    const subject = "Application Status Update - BCFI Teacher Application";
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);
    const message = `
  Dear ${applicantFullName},

  Thank you for your interest in the teaching position for the ${programName} specialization at Blancia College Foundation Inc.

After careful review of your application, we regret to inform you that we will not be moving forward with your application at this time.

Application Details:
- Application ID: ${application.id}
- Specialization: ${programName}
- Review Date: ${new Date().toLocaleDateString()}

${application.hrNotes ? `\nFeedback: ${application.hrNotes}` : ""}

Please note that you are welcome to apply again in the future. We encourage you to continue developing your skills and experience.

If you have any questions about this decision, please feel free to contact our HR department.

Thank you for your interest in Blancia College Foundation Inc.

Best regards,
BCFI HR Team
Blancia College Foundation Inc.
    `;

    await this.sendAndSaveNotification({
      email: applicant.email,
      subject,
      message,
      type: "rejection",
      applicationId: application.id,
    });
  }

  // Teaching demo schedule notification
  async sendDemoScheduleNotification(
    application: Application,
    applicant: User,
  ): Promise<void> {
    if (!application.demoSchedule) {
      throw new Error("Demo schedule not set");
    }

    const demoDate = application.demoSchedule.toLocaleDateString();
    const demoTime = application.demoSchedule.toLocaleTimeString();

    const subject = "Teaching Demo Scheduled - BCFI Teacher Application";
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);
    const message = `
Dear ${applicantFullName},

Your application for the ${programName} specialization has been approved.

DEMONSTRATION DETAILS:
- Date: ${demoDate}
- Time: ${demoTime}
- Specialization: ${programName}
- Application ID: ${application.id}

Please prepare a 1-hour lesson for your demonstration.
Dress appropriately.

If you need to reschedule due to an emergency, please contact our HR department as soon as possible.

Best regards,
BCFI HR Team
Blancia College Foundation Inc.
    `;

    await this.sendAndSaveNotification({
      email: applicant.email,
      subject,
      message,
      type: "schedule",
      applicationId: application.id,
    });
  }

  // Interview schedule notification
  async sendInterviewScheduleNotification(
    application: Application,
    applicant: User,
    stage: "initial" | "final" = "initial",
  ): Promise<void> {
    const appAny = application as any;
    const schedule =
      stage === "final"
        ? appAny.finalInterviewSchedule
        : appAny.initialInterviewSchedule;
    if (!schedule) {
      throw new Error("Interview schedule not set");
    }

    const interviewDate = schedule.toLocaleDateString();
    const interviewTime = schedule.toLocaleTimeString();

    const subject = `${stage === "final" ? "Final" : "Initial"} Interview Scheduled - BCFI Teacher Application`;
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);
    const message = `
Dear ${applicantFullName},

Your application for the ${programName} specialization has been scheduled for an interview.

INTERVIEW DETAILS:
- Date: ${interviewDate}
- Time: ${interviewTime}
- Application ID: ${application.id}

Please be prepared and on time. If you need to reschedule, contact our HR department.

Best regards,
BCFI HR Team
Blancia College Foundation Inc.
    `;

    await this.sendAndSaveNotification({
      email: applicant.email,
      subject,
      message,
      type: "schedule",
      applicationId: application.id,
    });
  }

  // Demo reschedule notification with reason-specific content
  async sendDemoRescheduleNotification(
    application: Application,
    applicant: User,
    reason?: string,
  ): Promise<void> {
    if (!application.demoSchedule) {
      throw new Error("Demo schedule not set");
    }

    const demoDate = application.demoSchedule.toLocaleDateString();
    const demoTime = application.demoSchedule.toLocaleTimeString();
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);

    let subject = "Teaching Demo Rescheduled - BCFI Teacher Application";
    let message = `\nDear ${applicantFullName},\n\n`;

    if (reason === "APPLICANT_NO_SHOW" || reason === "applicant_no_show") {
      subject = "Action Required: Rescheduling Your Teaching Demo - BCFI";
      message += `We were unable to proceed with your scheduled teaching demonstration for the ${programName} specialization because you did not appear at the scheduled time. We have rescheduled another demo for you as indicated below. Please make sure to attend the scheduled demo to avoid further rescheduling.\n\n`;
    } else if (reason === "SCHOOL" || reason === "school_reschedule") {
      subject = "Notice: Teaching Demo Rescheduled by HR - BCFI";
      message += `Your teaching demonstration for the ${programName} specialization has been rescheduled by our HR team due to scheduling or administrative reasons. We apologize for the inconvenience. Please see the updated schedule below.\n\n`;
    } else {
      // Generic reschedule message
      message += `Your teaching demonstration for the ${programName} specialization has been rescheduled. Please see the updated schedule below.\n\n`;
    }

    message += `DEMONSTRATION DETAILS:\n- Date: ${demoDate}\n- Time: ${demoTime}\n- Specialization: ${programName}\n- Application ID: ${application.id}\n\n`;

    message += `Please prepare a 1-hour lesson for your demonstration.\nDress appropriately.\n\n`;

    if (reason === "APPLICANT_NO_SHOW" || reason === "applicant_no_show") {
      message += `Note: Since you did not attend the previous schedule, please be punctual for the new one. Frequent no-shows may impact your application status or eligibility.\n\n`;
    }

    message += `If you need to reschedule again due to an emergency, please contact our HR department as soon as possible.\n\nBest regards,\nBCFI HR Team\nBlancia College Foundation Inc.`;

    await this.sendAndSaveNotification({
      email: applicant.email,
      subject,
      message,
      type: "reschedule",
      applicationId: application.id,
    });

    // Also notify HR with a concise alert about the reschedule and reason
    const hrEmails = await this.getHREmails();
    const hrSubject = `Application #${application.id} - Demo Rescheduled`;
    const hrMessage = `Application ID: ${
      application.id
    }\nApplicant: ${applicantFullName} (${
      applicant.email
    })\nSpecialization: ${programName}\nNew Demo: ${demoDate} at ${demoTime}\nReason: ${
      reason || "Not specified"
    }\n\nPlease review the schedule in the HR portal.`;
    for (const hrEmail of hrEmails) {
      await this.sendAndSaveNotification({
        email: hrEmail,
        subject: hrSubject,
        message: hrMessage,
        type: "hr_alert",
        applicationId: application.id,
      });
    }
  }

  // Final results notification
  async sendResultsNotification(
    application: Application,
    applicant: User,
    scores: any[],
  ): Promise<void> {
    if (!application.totalScore || !application.result) {
      throw new Error("Application scores not completed");
    }

    const subject = `Teaching Demo Results - BCFI Teacher Application`;
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);
    const resultText =
      application.result === "PASS"
        ? "Congratulations! You have passed"
        : "Unfortunately, you did not pass";

    let scoresBreakdown = "";
    if (scores && scores.length > 0) {
      scoresBreakdown = "\nScore Breakdown:\n";
      scores.forEach((score) => {
        scoresBreakdown += `- ${score.rubric.criteria}: ${score.scoreValue}/${score.rubric.maxScore}`;
        if (score.comments) {
          scoresBreakdown += ` (${score.comments})`;
        }
        scoresBreakdown += "\n";
      });
    }

    const message = `
  Dear ${applicantFullName},

  Your teaching demonstration for the ${programName} specialization has been evaluated.

${resultText} the teaching demonstration evaluation.

Final Results:
- Overall Score: ${application.totalScore.toFixed(1)}%
- Result: ${application.result}
- Evaluation Date: ${new Date().toLocaleDateString()}

${scoresBreakdown}

${
  application.result === "PASS"
    ? `Congratulations! You will be notified on your account regarding the next steps in the hiring process.`
    : `We appreciate your effort and encourage you to continue developing your teaching skills. You are welcome to apply again in the future.`
}

If you have any questions about your evaluation, please contact our HR department.

Best regards,
BCFI HR Team
Blancia College Foundation Inc.
    `;

    await this.sendAndSaveNotification({
      email: applicant.email,
      subject,
      message,
      type: "result",
      applicationId: application.id,
    });
  }

  async sendFinalInterviewPassedNotification(
    application: Application,
    applicant: User,
  ): Promise<void> {
    const subject = `Congratulations! Passed Final Interview - BCFI Teacher Application`;
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);

    const message = `
Dear ${applicantFullName},

Congratulations! We are pleased to inform you that you have successfully passed all stages of the application process for the ${programName} position:

✅ Demo Teaching - Passed
✅ Initial Interview - Passed
✅ Final Interview - Passed

This is a significant achievement, and we are excited about the possibility of you joining our team.

Next Steps:
Please log in to your applicant portal and go to the "Pre-Employment" page to submit the requirements. You are required to submit the necessary pre-employment requirements to finalize your hiring process.

If you have any questions or need assistance, please do not hesitate to contact our HR department.

Best regards,
BCFI HR Team
Blancia College Foundation Inc.
    `;

    await this.sendAndSaveNotification(
      {
        email: applicant.email,
        subject,
        message,
        type: "result",
        applicationId: application.id,
      },
      `Congratulations! You have passed the final interview for ${programName}. Please proceed to the Pre-Employment page to submit your requirements.`,
    );
  }

  // Helper method to get HR email addresses
  private async getHREmails(): Promise<string[]> {
    const hrUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ["HR", "ADMIN"],
        },
      },
      select: {
        email: true,
      },
    });

    return hrUsers.map((user) => user.email);
  }

  // Get notification history
  async getNotificationHistory(filters?: {
    email?: string;
    type?: string;
    applicationId?: number;
    limit?: number;
  }): Promise<any[]> {
    const { email, type, applicationId, limit = 50 } = filters || {};

    return await prisma.notification.findMany({
      where: {
        ...(email && { email }),
        ...(type && { type }),
        ...(applicationId && { applicationId }),
      },
      orderBy: { sentAt: "desc" },
      take: limit,
    });
  }
}

export default new NotificationService();
