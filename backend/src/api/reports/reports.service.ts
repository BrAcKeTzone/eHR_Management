import {
  Application,
  ApplicationStatus,
  ApplicationResult,
  User,
} from "@prisma/client";
import prisma from "../../configs/prisma";
import ApiError from "../../utils/ApiError";

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  status?: ApplicationStatus;
  result?: ApplicationResult;
  program?: string;
}

export interface ReportStatistics {
  totalApplications: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
  statusBreakdown: {
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
  };
  programBreakdown: Record<string, number>;
  averageProcessingTime: number;
  passRate: number;
}

class ReportsService {
  // Get applications data for reports
  async getApplicationsData(filters?: ReportFilters) {
    const whereClause: any = {};

    if (filters?.startDate || filters?.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = new Date(filters.endDate);
      }
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.result) {
      whereClause.result = filters.result;
    }

    if (filters?.program) {
      whereClause.program = { contains: filters.program };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
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
    });

    return applications;
  }

  // Get scoring data for reports (completed applications with scores)
  async getScoringData(filters?: ReportFilters) {
    const whereClause: any = {
      status: ApplicationStatus.COMPLETED,
      totalScore: { not: null },
    };

    if (filters?.startDate || filters?.endDate) {
      whereClause.updatedAt = {};
      if (filters.startDate) {
        whereClause.updatedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.updatedAt.lte = new Date(filters.endDate);
      }
    }

    if (filters?.result) {
      whereClause.result = filters.result;
    }

    if (filters?.program) {
      whereClause.program = { contains: filters.program };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
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
      orderBy: { updatedAt: "desc" },
    });

    return applications;
  }

  // Get applicants data for reports
  async getApplicantsData(filters?: ReportFilters) {
    const users = await prisma.user.findMany({
      where: {
        role: "APPLICANT",
      },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Apply filters if needed
    let filteredUsers = users;

    if (filters?.startDate || filters?.endDate) {
      filteredUsers = users.filter((user) => {
        const hasMatchingApp = user.applications.some((app) => {
          const appDate = new Date(app.createdAt);
          const start = filters.startDate ? new Date(filters.startDate) : null;
          const end = filters.endDate ? new Date(filters.endDate) : null;

          if (start && appDate < start) return false;
          if (end && appDate > end) return false;
          return true;
        });
        return hasMatchingApp;
      });
    }

    return filteredUsers;
  }

  // Generate CSV for applications
  generateApplicationsCSV(applications: any[]): string {
    const headers = [
      "ID",
      "Applicant Name",
      "Email",
      "Phone",
      "Program",
      "Status",
      "Result",
      "Total Score",
      "Date Created",
      "Date Updated",
      "Attempt Number",
      "Demo Schedule",
      "Demo Location",
      "HR Notes",
    ];

    const rows = applications.map((app) => [
      app.id,
      app.applicant.name,
      app.applicant.email,
      app.applicant.phone || "",
      app.program,
      app.status,
      app.result || "",
      app.totalScore || "",
      new Date(app.createdAt).toLocaleDateString(),
      new Date(app.updatedAt).toLocaleDateString(),
      app.attemptNumber,
      app.demoSchedule ? new Date(app.demoSchedule).toLocaleString() : "",
      app.demoLocation || "",
      app.hrNotes || "",
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  }

  // Generate CSV for scoring
  generateScoringCSV(applications: any[]): string {
    const headers = [
      "Application ID",
      "Applicant Name",
      "Email",
      "Program",
      "Total Score",
      "Result",
      "Demo Date",
      "Demo Location",
      "HR Notes",
      "Date Completed",
    ];

    const rows = applications.map((app) => [
      app.id,
      app.applicant.name,
      app.applicant.email,
      app.program,
      app.totalScore || "",
      app.result || "",
      app.demoSchedule ? new Date(app.demoSchedule).toLocaleString() : "",
      app.demoLocation || "",
      app.hrNotes || "",
      new Date(app.updatedAt).toLocaleDateString(),
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  }

  // Generate CSV for applicants
  generateApplicantsCSV(users: any[]): string {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Total Applications",
      "Programs Applied",
      "Latest Status",
      "Latest Result",
      "Latest Application Date",
    ];

    const rows = users.map((user) => {
      const applications = user.applications;
      const latestApp = applications[0];
      const programs = [
        ...new Set(applications.map((app: any) => app.program)),
      ].join("; ");

      return [
        user.name,
        user.email,
        user.phone || "",
        applications.length,
        programs,
        latestApp?.status || "",
        latestApp?.result || "",
        latestApp ? new Date(latestApp.createdAt).toLocaleDateString() : "",
      ];
    });

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  }

  // Get report statistics
  async getReportStatistics(dateRange?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ReportStatistics> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Build where clause for date range if provided
    const whereClause: any = {};
    if (dateRange?.startDate || dateRange?.endDate) {
      whereClause.createdAt = {};
      if (dateRange.startDate) {
        whereClause.createdAt.gte = new Date(dateRange.startDate);
      }
      if (dateRange.endDate) {
        whereClause.createdAt.lte = new Date(dateRange.endDate);
      }
    }

    // Get all applications for statistics
    const [
      totalApplications,
      thisMonth,
      lastMonth,
      statusCounts,
      completedApplications,
      allApplications,
    ] = await Promise.all([
      prisma.application.count({ where: whereClause }),
      prisma.application.count({
        where: {
          ...whereClause,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.application.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      Promise.all([
        prisma.application.count({
          where: { ...whereClause, status: ApplicationStatus.PENDING },
        }),
        prisma.application.count({
          where: { ...whereClause, status: ApplicationStatus.APPROVED },
        }),
        prisma.application.count({
          where: { ...whereClause, status: ApplicationStatus.REJECTED },
        }),
        prisma.application.count({
          where: { ...whereClause, status: ApplicationStatus.COMPLETED },
        }),
      ]),
      prisma.application.findMany({
        where: {
          ...whereClause,
          status: ApplicationStatus.COMPLETED,
        },
        select: {
          createdAt: true,
          updatedAt: true,
          result: true,
        },
      }),
      prisma.application.findMany({
        where: whereClause,
        select: {
          program: true,
        },
      }),
    ]);

    // Calculate growth percentage
    const growth =
      lastMonth > 0
        ? ((thisMonth - lastMonth) / lastMonth) * 100
        : thisMonth > 0
        ? 100
        : 0;

    // Calculate status breakdown
    const statusBreakdown = {
      pending: statusCounts[0],
      approved: statusCounts[1],
      rejected: statusCounts[2],
      completed: statusCounts[3],
    };

    // Calculate program breakdown
    const programBreakdown: Record<string, number> = {};
    allApplications.forEach((app) => {
      programBreakdown[app.program] = (programBreakdown[app.program] || 0) + 1;
    });

    // Calculate average processing time (days from creation to completion)
    let averageProcessingTime = 0;
    if (completedApplications.length > 0) {
      const totalDays = completedApplications.reduce((sum, app) => {
        const days = Math.floor(
          (new Date(app.updatedAt).getTime() -
            new Date(app.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      averageProcessingTime = Math.round(
        totalDays / completedApplications.length
      );
    }

    // Calculate pass rate
    const passedApplications = completedApplications.filter(
      (app) => app.result === ApplicationResult.PASS
    ).length;
    const passRate =
      completedApplications.length > 0
        ? (passedApplications / completedApplications.length) * 100
        : 0;

    return {
      totalApplications,
      thisMonth,
      lastMonth,
      growth: Math.round(growth * 10) / 10,
      statusBreakdown,
      programBreakdown,
      averageProcessingTime,
      passRate: Math.round(passRate * 10) / 10,
    };
  }

  // Get dashboard analytics
  async getDashboardAnalytics() {
    const stats = await this.getReportStatistics();

    // Get monthly trend (last 6 months)
    const monthlyTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const count = await prisma.application.count({
        where: {
          createdAt: {
            gte: monthDate,
            lt: nextMonth,
          },
        },
      });

      monthlyTrend.push({
        month: monthDate.toLocaleString("default", { month: "short" }),
        applications: count,
      });
    }

    // Get top programs
    const topPrograms = Object.entries(stats.programBreakdown)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      ...stats,
      topPrograms,
      monthlyTrend,
    };
  }
}

export default new ReportsService();
