import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import reportsService from "./reports.service";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import asyncHandler from "../../utils/asyncHandler";
import PDFDocument from "pdfkit";

// Get report statistics
export const getReportStatistics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can access reports");
    }

    const { startDate, endDate } = req.query;

    const statistics = await reportsService.getReportStatistics({
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json(
      new ApiResponse(
        200,
        statistics,
        "Report statistics retrieved successfully"
      )
    );
  }
);

// Get dashboard analytics
export const getDashboardAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can access analytics");
    }

    const analytics = await reportsService.getDashboardAnalytics();

    res.json(
      new ApiResponse(
        200,
        analytics,
        "Dashboard analytics retrieved successfully"
      )
    );
  }
);

// Export applications report as CSV
export const exportApplicationsCSV = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can export reports");
    }

    const { startDate, endDate, status, result, program } = req.query;

    const applications = await reportsService.getApplicationsData({
      startDate: startDate as string,
      endDate: endDate as string,
      status: status as any,
      result: result as any,
      program: program as string,
    });

    const csv = reportsService.generateApplicationsCSV(applications);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=applications_report_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    res.send(csv);
  }
);

// Export scoring report as CSV
export const exportScoringCSV = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can export reports");
    }

    const { startDate, endDate, result, program } = req.query;

    const applications = await reportsService.getScoringData({
      startDate: startDate as string,
      endDate: endDate as string,
      result: result as any,
      program: program as string,
    });

    const csv = reportsService.generateScoringCSV(applications);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=scoring_report_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    res.send(csv);
  }
);

// Export applicants report as CSV
export const exportApplicantsCSV = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can export reports");
    }

    const { startDate, endDate } = req.query;

    const users = await reportsService.getApplicantsData({
      startDate: startDate as string,
      endDate: endDate as string,
    });

    const csv = reportsService.generateApplicantsCSV(users);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=applicants_report_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    res.send(csv);
  }
);

// Generate Applications PDF Report
export const generateApplicationsPDF = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can generate reports");
    }

    const { startDate, endDate, status, result, program } = req.query;

    const applications = await reportsService.getApplicationsData({
      startDate: startDate as string,
      endDate: endDate as string,
      status: status as any,
      result: result as any,
      program: program as string,
    });

    const statistics = await reportsService.getReportStatistics({
      startDate: startDate as string,
      endDate: endDate as string,
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=applications_report_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add content
    doc
      .fontSize(20)
      .text("BLANCIA COLLEGE FOUNDATION INC.", { align: "center" });
    doc.fontSize(16).text("APPLICATIONS REPORT", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, {
        align: "center",
      });
    doc.moveDown(2);

    // Summary Section
    doc.fontSize(14).text("SUMMARY", { underline: true });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Total Applications: ${statistics.totalApplications}`);
    doc.text(`Pending Review: ${statistics.statusBreakdown.pending}`);
    doc.text(`Approved: ${statistics.statusBreakdown.approved}`);
    doc.text(`Rejected: ${statistics.statusBreakdown.rejected}`);
    doc.text(`Completed: ${statistics.statusBreakdown.completed}`);
    doc.text(`Pass Rate: ${statistics.passRate}%`);
    doc.text(
      `Average Processing Time: ${statistics.averageProcessingTime} days`
    );
    doc.moveDown(2);

    // Applications Details
    doc.fontSize(14).text("APPLICATIONS DETAILS", { underline: true });
    doc.moveDown();

    applications.forEach((app, index) => {
      doc.fontSize(10);
      doc.text(
        `${index + 1}. ${app.applicant.name} (Attempt #${app.attemptNumber})`
      );
      doc.text(`   Program: ${app.program}`, { indent: 20 });
      doc.text(`   Status: ${app.status} | Result: ${app.result || "N/A"}`, {
        indent: 20,
      });
      if (app.totalScore) {
        doc.text(`   Score: ${app.totalScore}%`, { indent: 20 });
      }
      doc.text(`   Date: ${new Date(app.createdAt).toLocaleDateString()}`, {
        indent: 20,
      });
      doc.moveDown(0.5);
    });

    doc.moveDown();

    // Statistics Section
    doc.fontSize(14).text("PROGRAM STATISTICS", { underline: true });
    doc.moveDown();
    doc.fontSize(10);
    Object.entries(statistics.programBreakdown).forEach(([program, count]) => {
      const percentage = ((count / statistics.totalApplications) * 100).toFixed(
        1
      );
      doc.text(`${program}: ${count} (${percentage}%)`);
    });

    // Finalize PDF
    doc.end();
  }
);

// Generate Scoring PDF Report
export const generateScoringPDF = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can generate reports");
    }

    const { startDate, endDate, result, program } = req.query;

    const applications = await reportsService.getScoringData({
      startDate: startDate as string,
      endDate: endDate as string,
      result: result as any,
      program: program as string,
    });

    // Calculate statistics
    const totalScored = applications.length;
    const avgScore =
      totalScored > 0
        ? applications.reduce((sum, app) => sum + (app.totalScore || 0), 0) /
          totalScored
        : 0;
    const passed = applications.filter((app) => app.result === "PASS").length;
    const passRate = totalScored > 0 ? (passed / totalScored) * 100 : 0;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=scoring_report_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add content
    doc
      .fontSize(20)
      .text("BLANCIA COLLEGE FOUNDATION INC.", { align: "center" });
    doc.fontSize(16).text("SCORING REPORT", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, {
        align: "center",
      });
    doc.moveDown(2);

    // Overall Statistics
    doc.fontSize(14).text("OVERALL STATISTICS", { underline: true });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Total Demos Scored: ${totalScored}`);
    doc.text(`Average Score: ${avgScore.toFixed(2)}%`);
    doc.text(`Pass Rate: ${passRate.toFixed(2)}%`);
    doc.text(`Passing Threshold: 75%`);
    doc.moveDown(2);

    // Detailed Scores
    doc.fontSize(14).text("DETAILED SCORES", { underline: true });
    doc.moveDown();

    applications.forEach((app, index) => {
      doc.fontSize(10);
      doc.text(`${index + 1}. ${app.applicant.name} - ${app.program}`);
      doc.text(`   Total Score: ${app.totalScore}% - ${app.result}`, {
        indent: 20,
      });
      if (app.hrNotes) {
        doc.text(`   Notes: ${app.hrNotes}`, { indent: 20 });
      }
      doc.text(
        `   Date Completed: ${new Date(app.updatedAt).toLocaleDateString()}`,
        { indent: 20 }
      );
      doc.moveDown(0.5);
    });

    // Finalize PDF
    doc.end();
  }
);

// Generate Applicants PDF Report
export const generateApplicantsPDF = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!["HR", "ADMIN"].includes(req.user!.role)) {
      throw new ApiError(403, "Only HR and Admin can generate reports");
    }

    const { startDate, endDate } = req.query;

    const users = await reportsService.getApplicantsData({
      startDate: startDate as string,
      endDate: endDate as string,
    });

    // Calculate statistics
    const totalApplicants = users.length;
    const returningApplicants = users.filter(
      (u) => u.applications.length > 1
    ).length;
    const newApplicants = totalApplicants - returningApplicants;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=applicants_report_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add content
    doc
      .fontSize(20)
      .text("BLANCIA COLLEGE FOUNDATION INC.", { align: "center" });
    doc.fontSize(16).text("APPLICANT REPORT", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, {
        align: "center",
      });
    doc.moveDown(2);

    // Applicant Summary
    doc.fontSize(14).text("APPLICANT SUMMARY", { underline: true });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Total Unique Applicants: ${totalApplicants}`);
    doc.text(`Returning Applicants: ${returningApplicants}`);
    doc.text(`New Applicants: ${newApplicants}`);
    doc.moveDown(2);

    // Applicant Profiles
    doc.fontSize(14).text("APPLICANT PROFILES", { underline: true });
    doc.moveDown();

    users.forEach((user, index) => {
      const latestApp = user.applications[0];
      const programs = [
        ...new Set(user.applications.map((app) => app.program)),
      ].join(", ");

      doc.fontSize(10);
      doc.text(`${index + 1}. ${user.name} (${user.email})`);
      doc.text(`   Total Applications: ${user.applications.length}`, {
        indent: 20,
      });
      doc.text(`   Programs: ${programs}`, { indent: 20 });
      if (latestApp) {
        doc.text(`   Latest Status: ${latestApp.status}`, { indent: 20 });
        if (latestApp.result) {
          doc.text(`   Latest Result: ${latestApp.result}`, { indent: 20 });
        }
      }
      doc.moveDown(0.5);
    });

    // Finalize PDF
    doc.end();
  }
);
