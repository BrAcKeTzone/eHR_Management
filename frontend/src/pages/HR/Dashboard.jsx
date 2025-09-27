import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import { useAuthStore } from "../../store/authStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import { formatDate } from "../../utils/formatDate";
import { useNavigate } from "react-router-dom";

const HRDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { applications, getAllApplications, loading, error } =
    useApplicationStore();

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    total: 0,
  });

  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    getAllApplications();
  }, [getAllApplications]);

  useEffect(() => {
    if (applications) {
      // Calculate statistics
      const newStats = applications.reduce(
        (acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          acc.total += 1;
          return acc;
        },
        { pending: 0, approved: 0, rejected: 0, completed: 0, total: 0 }
      );

      setStats(newStats);

      // Get recent applications (last 10)
      const recent = applications
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      setRecentApplications(recent);
    }
  }, [applications]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleQuickAction = (action, applicationId = null) => {
    switch (action) {
      case "review":
        navigate("/hr/review");
        break;
      case "schedule":
        navigate("/hr/scheduling");
        break;
      case "scoring":
        navigate("/hr/scoring");
        break;
      case "reports":
        navigate("/hr/reports");
        break;
      case "view-application":
        navigate(`/hr/applications/${applicationId}`);
        break;
      default:
        break;
    }
  };

  const recentApplicationsColumns = [
    {
      header: "Applicant",
      accessor: "applicant_name",
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.applicant_name}</p>
          <p className="text-sm text-gray-500">{row.applicant_email}</p>
        </div>
      ),
    },
    {
      header: "Program",
      accessor: "program",
      cell: (row) => (
        <div className="text-sm">
          <p className="font-medium">{row.program}</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            row.status
          )}`}
        >
          {row.status?.toUpperCase()}
        </span>
      ),
    },
    {
      header: "Submitted",
      accessor: "created_at",
      cell: (row) => (
        <div className="text-sm text-gray-600">
          {formatDate(row.created_at)}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <Button
          onClick={() => handleQuickAction("view-application", row.id)}
          variant="outline"
          size="sm"
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          HR Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}! Here's an overview of application
          activities.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <DashboardCard
          title="Total"
          className="text-center col-span-2 md:col-span-1"
        >
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {stats.total}
          </div>
        </DashboardCard>

        <DashboardCard title="Pending" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
            {stats.pending}
          </div>
        </DashboardCard>

        <DashboardCard title="Approved" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">
            {stats.approved}
          </div>
        </DashboardCard>

        <DashboardCard title="Rejected" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-600">
            {stats.rejected}
          </div>
        </DashboardCard>

        <DashboardCard title="Completed" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {stats.completed}
          </div>
        </DashboardCard>
      </div>

      {/* Quick Actions & Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <DashboardCard title="Quick Actions" className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleQuickAction("review")}
              variant="primary"
              className="flex flex-col items-center p-2 sm:p-4 h-auto text-center"
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-xs sm:text-sm">Review Apps</span>
              {stats.pending > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full mt-1">
                  {stats.pending}
                </span>
              )}
            </Button>

            <Button
              onClick={() => handleQuickAction("schedule")}
              variant="outline"
              className="flex flex-col items-center p-2 sm:p-4 h-auto text-center"
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs sm:text-sm">Schedule</span>
            </Button>

            <Button
              onClick={() => handleQuickAction("scoring")}
              variant="outline"
              className="flex flex-col items-center p-2 sm:p-4 h-auto text-center"
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-xs sm:text-sm">Score Demos</span>
            </Button>

            <Button
              onClick={() => handleQuickAction("reports")}
              variant="outline"
              className="flex flex-col items-center p-2 sm:p-4 h-auto text-center"
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-xs sm:text-sm">Reports</span>
            </Button>
          </div>
        </DashboardCard>

        <DashboardCard title="Priority Tasks" className="lg:col-span-2">
          <div className="space-y-4">
            {stats.pending > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-yellow-900">
                      Pending Reviews
                    </p>
                    <p className="text-sm text-yellow-700">
                      {stats.pending} applications waiting
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleQuickAction("review")}
                  variant="outline"
                  size="sm"
                  className="ml-2 flex-shrink-0"
                >
                  Review
                </Button>
              </div>
            )}

            {stats.approved > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-green-900">Schedule Demos</p>
                    <p className="text-sm text-green-700">
                      {stats.approved} approved applications
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleQuickAction("schedule")}
                  variant="outline"
                  size="sm"
                  className="ml-2 flex-shrink-0"
                >
                  Schedule
                </Button>
              </div>
            )}

            {stats.pending === 0 && stats.approved === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">All caught up! No urgent tasks.</p>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Recent Applications */}
      <DashboardCard title="Recent Applications">
        {recentApplications.length > 0 ? (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table
                columns={recentApplicationsColumns}
                data={recentApplications}
              />
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {recentApplications.map((app, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 break-words">
                        {app.applicant_name}
                      </h3>
                      <p className="text-sm text-gray-500 break-all">
                        {app.applicant_email}
                      </p>
                      <p className="text-sm font-medium break-words mt-1">
                        {app.program}
                      </p>
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      Submitted: {formatDate(app.created_at)}
                    </span>
                    <Button
                      onClick={() =>
                        handleQuickAction("view-application", app.id)
                      }
                      variant="outline"
                      size="sm"
                      className="ml-2 flex-shrink-0"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No applications found.</p>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

export default HRDashboard;
