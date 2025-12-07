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
  private async sendAndSaveNotification(data: NotificationData): Promise<void> {
    try {
      await sendEmail({
        email: data.email,
        subject: data.subject,
        message: data.message,
      });

      await this.saveNotification(data);
    } catch (error) {
      console.error("Failed to send notification:", error);
      throw error;
    }
  }

  // Application submission confirmation to applicant
  async sendApplicationSubmissionNotification(
    application: Application,
    applicant: User
  ): Promise<void> {
    const subject =
      "Application Submitted Successfully - BCFI Teacher Application";
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);
    const message = `
Dear ${applicantFullName},

Thank you for submitting your teacher application for the ${programName} program at Blancia College Foundation Inc.

Application Details:
- Application ID: ${application.id}
- Attempt Number: ${application.attemptNumber}
- Program: ${programName}
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
    applicant: User
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
  - Program: ${programName}
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
    applicant: User
  ): Promise<void> {
    const subject = "Application Approved - Teaching Demo Scheduling - BCFI";
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);
    const message = `
  Dear ${applicantFullName},

  Congratulations! Your teacher application for the ${programName} program has been approved.

Application Details:
- Application ID: ${application.id}
- Program: ${programName}
- Approval Date: ${new Date().toLocaleDateString()}

Next Steps:
Our HR team will contact you shortly to schedule your teaching demonstration. Please ensure you're available for the demo as this is a crucial part of our evaluation process.

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
    applicant: User
  ): Promise<void> {
    const subject = "Application Status Update - BCFI Teacher Application";
    const applicantFullName = this.getApplicantFullName(applicant);
    const programName = this.getApplicationProgram(application);
    const message = `
  Dear ${applicantFullName},

  Thank you for your interest in the teaching position for the ${programName} program at Blancia College Foundation Inc.

After careful review of your application, we regret to inform you that we will not be moving forward with your application at this time.

Application Details:
- Application ID: ${application.id}
- Program: ${programName}
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
    applicant: User
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

  Your teaching demonstration has been scheduled for your ${programName} program application.

Demo Details:
- Date: ${demoDate}
- Time: ${demoTime}
- Program: ${programName}
- Application ID: ${application.id}

Important Instructions:
1. Please arrive 15 minutes early for setup
2. Prepare a 20-30 minute lesson on a topic relevant to your program
3. Bring any materials you need for your demonstration
4. Dress professionally
5. Be prepared to answer questions about your teaching methodology

If you need to reschedule due to an emergency, please contact our HR department as soon as possible.

We look forward to seeing your teaching skills in action!

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

  // Final results notification
  async sendResultsNotification(
    application: Application,
    applicant: User,
    scores: any[]
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

  Your teaching demonstration for the ${programName} program has been evaluated.

${resultText} the teaching demonstration evaluation.

Final Results:
- Overall Score: ${application.totalScore.toFixed(1)}%
- Result: ${application.result}
- Evaluation Date: ${new Date().toLocaleDateString()}

${scoresBreakdown}

${
  application.result === "PASS"
    ? `Congratulations! Our HR team will contact you soon regarding the next steps in the hiring process.`
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
