import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import { useReportStore } from "../../store/reportStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { formatDate } from "../../utils/formatDate";

const Reports = () => {
  const {
    applications,
    getAllApplications,
    loading: appLoading,
    error: appError,
  } = useApplicationStore();

  const {
    generateApplicationReport,
    generateScoringReport,
    generateApplicantReport,
    getReportStatistics,
    getDashboardAnalytics,
    exportToCsv,
    exportToPdf,
    reportStatistics,
    dashboardAnalytics,
    loading: reportLoading,
    error: reportError,
  } = useReportStore();

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    program: "",
    result: "",
  });

  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAllApplications();
    getDashboardAnalytics().then(setAnalytics);
    getReportStatistics();
  }, [getAllApplications, getDashboardAnalytics, getReportStatistics]);

  const handleGenerateReport = async (reportType, format = "pdf") => {
    try {
      let blob;
      const reportFilters = {
        ...filters,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };

      switch (reportType) {
        case "applications":
          if (format === "csv") {
            blob = await exportToCsv("applications", reportFilters);
          } else {
            blob = await generateApplicationReport(reportFilters);
          }
          break;
        case "scoring":
          if (format === "csv") {
            blob = await exportToCsv("scoring", reportFilters);
          } else {
            blob = await generateScoringReport(reportFilters);
          }
          break;
        case "applicants":
          if (format === "csv") {
            blob = await exportToCsv("applicants", reportFilters);
          } else {
            blob = await generateApplicantReport(reportFilters);
          }
          break;
        default:
          return;
      }

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}_report_${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  const getStatusStats = () => {
    if (!applications)
      return { pending: 0, approved: 0, rejected: 0, completed: 0 };

    return applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, completed: 0 }
    );
  };

  const getResultStats = () => {
    if (!applications) return { pass: 0, fail: 0 };

    const completedApps = applications.filter(
      (app) => app.status === "completed" && app.result
    );
    return completedApps.reduce(
      (acc, app) => {
        acc[app.result] = (acc[app.result] || 0) + 1;
        return acc;
      },
      { pass: 0, fail: 0 }
    );
  };

  const statusStats = getStatusStats();
  const resultStats = getResultStats();
  const loading = appLoading || reportLoading;
  const error = appError || reportError;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reports & Analytics
        </h1>
        <p className="text-gray-600">
          Generate comprehensive reports and view application analytics.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Applications" className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {applications?.length || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">All time</div>
        </DashboardCard>

        <DashboardCard title="This Month" className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {analytics?.thisMonth || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">New applications</div>
        </DashboardCard>

        <DashboardCard title="Pass Rate" className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {resultStats.pass + resultStats.fail > 0
              ? Math.round(
                  (resultStats.pass / (resultStats.pass + resultStats.fail)) *
                    100
                )
              : 0}
            %
          </div>
          <div className="text-sm text-gray-500 mt-1">Overall success</div>
        </DashboardCard>

        <DashboardCard title="Avg. Processing" className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {analytics?.avgProcessingTime || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">Days to completion</div>
        </DashboardCard>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Application Status Breakdown">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Review</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${
                        applications
                          ? (statusStats.pending / applications.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {statusStats.pending}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        applications
                          ? (statusStats.approved / applications.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {statusStats.approved}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rejected</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${
                        applications
                          ? (statusStats.rejected / applications.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {statusStats.rejected}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        applications
                          ? (statusStats.completed / applications.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {statusStats.completed}
                </span>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Assessment Results">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {resultStats.pass}
              </div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {resultStats.fail}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>

            {resultStats.pass + resultStats.fail > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Success Rate</span>
                  <span>
                    {Math.round(
                      (resultStats.pass /
                        (resultStats.pass + resultStats.fail)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (resultStats.pass /
                          (resultStats.pass + resultStats.fail)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Report Generation */}
      <DashboardCard title="Generate Reports">
        {/* Filters */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-4">Report Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />

            <Input
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <Input
              label="Program"
              value={filters.program}
              onChange={(e) =>
                setFilters({ ...filters, program: e.target.value })
              }
              placeholder="Filter by program"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result
              </label>
              <select
                value={filters.result}
                onChange={(e) =>
                  setFilters({ ...filters, result: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Results</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report Generation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Applications Report */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-2">
              Applications Report
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Comprehensive list of all applications with status and details.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => handleGenerateReport("applications", "pdf")}
                variant="primary"
                size="sm"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Generating..." : "Generate PDF"}
              </Button>
              <Button
                onClick={() => handleGenerateReport("applications", "csv")}
                variant="outline"
                size="sm"
                disabled={loading}
                className="w-full"
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Scoring Report */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-2">Scoring Report</h4>
            <p className="text-sm text-gray-600 mb-4">
              Detailed analysis of demo scores and assessment results.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => handleGenerateReport("scoring", "pdf")}
                variant="primary"
                size="sm"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Generating..." : "Generate PDF"}
              </Button>
              <Button
                onClick={() => handleGenerateReport("scoring", "csv")}
                variant="outline"
                size="sm"
                disabled={loading}
                className="w-full"
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Applicants Report */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-2">
              Applicants Report
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Summary of applicant information and application history.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => handleGenerateReport("applicants", "pdf")}
                variant="primary"
                size="sm"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Generating..." : "Generate PDF"}
              </Button>
              <Button
                onClick={() => handleGenerateReport("applicants", "csv")}
                variant="outline"
                size="sm"
                disabled={loading}
                className="w-full"
              >
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Recent Activity */}
      {applications && applications.length > 0 && (
        <DashboardCard title="Recent Activity" className="mt-8">
          <div className="space-y-3">
            {applications
              .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
              .slice(0, 10)
              .map((app, index) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {app.applicant_name} - {app.program}
                    </p>
                    <p className="text-xs text-gray-500">
                      Status changed to {app.status} on{" "}
                      {formatDate(app.updated_at)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      app.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : app.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : app.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {app.status?.toUpperCase()}
                  </span>
                </div>
              ))}
          </div>
        </DashboardCard>
      )}
    </div>
  );
};

export default Reports;
