import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import { useAuthStore } from "../../store/authStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import { formatDate } from "../../utils/formatDate";
import { useNavigate } from "react-router-dom";
import ApplicationDetailsModal from "../../components/ApplicationDetailsModal";
import SpecializationModal from "../../features/dashboard/SpecializationModal";

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
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  // Quick picks used by the buttons in Quick Actions
  const nextToSchedule = applications?.find(
    (a) => !a.demoSchedule && a.status?.toLowerCase() === "approved",
  );
  const nextToScore = applications?.find(
    (a) =>
      a.demoSchedule && (a.totalScore === undefined || a.totalScore === null),
  );

  useEffect(() => {
    getAllApplications();
  }, [getAllApplications]);

  useEffect(() => {
    if (applications) {
      const newStats = applications.reduce(
        (acc, app) => {
          const status = app.status?.toLowerCase();
          acc[status] = (acc[status] || 0) + 1;
          acc.total += 1;
          return acc;
        },
        { pending: 0, approved: 0, rejected: 0, completed: 0, total: 0 },
      );

      setStats(newStats);

      const recent = applications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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

  const getResultColor = (result) => {
    switch (result?.toLowerCase()) {
      case "pass":
        return "bg-green-100 text-green-800";
      case "fail":
        return "bg-red-100 text-red-800";
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
        navigate(
          applicationId
            ? `/hr/scheduling?applicationId=${applicationId}`
            : "/hr/scheduling",
        );
        break;
      case "scoring":
        navigate(
          applicationId
            ? `/hr/scoring?applicationId=${applicationId}`
            : "/hr/scoring",
        );
        break;
      case "reports":
        navigate("/hr/reports");
        break;
      case "view-application":
        const app = recentApplications.find((a) => a.id === applicationId);
        if (app) {
          setSelectedApplication(app);
          setShowModal(true);
        }
        break;
      default:
        break;
    }
  };

  const recentApplicationsColumns = [
    {
      header: "Applicant",
      accessor: (row) =>
        `${row.applicant?.firstName} ${row.applicant?.lastName}`,
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.applicant?.firstName} {row.applicant?.lastName || "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            {row.applicant?.email || "N/A"}
          </p>
        </div>
      ),
    },
    {
      header: "Status / Result",
      accessor: "status",
      cell: (row) => (
        <div className="space-y-1">
          <div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                row.status,
              )}`}
            >
              {row.status?.toUpperCase()}
            </span>
          </div>
          {row.result && (
            <div>
              <span className="text-xs text-gray-500 mr-2">Demo Result:</span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                  row.result,
                )}`}
              >
                {row.result?.toUpperCase()}
              </span>
            </div>
          )}
          {row.result?.toLowerCase() === "pass" && row.interviewResult && (
            <div>
              <span className="text-xs text-gray-500 mr-2">
                Interview Result:
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                  row.interviewResult,
                )}`}
              >
                {row.interviewResult?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Submitted",
      accessor: "createdAt",
      cell: (row) => (
        <div className="text-sm text-gray-600">{formatDate(row.createdAt)}</div>
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
      <div className="mb-6 sm:mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            HR Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName} {user?.lastName}! Here's an overview
            of application activities.
          </p>
        </div>
        <Button onClick={() => setIsSpecModalOpen(true)}>
          Manage Specializations
        </Button>
      </div>

      <SpecializationModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />

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
              <span className="text-xs sm:text-sm">Review Apps</span>
            </Button>
            <Button
              onClick={() =>
                handleQuickAction(
                  "schedule",
                  nextToSchedule ? nextToSchedule.id : null,
                )
              }
              variant="outline"
              className="flex flex-col items-center p-2 sm:p-4 h-auto text-center"
              disabled={!nextToSchedule}
            >
              {nextToSchedule ? "Schedule" : "No apps to schedule"}
            </Button>
            <Button
              onClick={() =>
                handleQuickAction(
                  "scoring",
                  nextToScore ? nextToScore.id : null,
                )
              }
              variant="outline"
              className="flex flex-col items-center p-2 sm:p-4 h-auto text-center"
              disabled={!nextToScore}
            >
              <span className="text-xs sm:text-sm">Score Demos</span>
            </Button>
            <Button
              onClick={() => handleQuickAction("reports")}
              variant="outline"
              className="flex flex-col items-center p-2 sm:p-4 h-auto text-center"
            >
              <span className="text-xs sm:text-sm">Reports</span>
            </Button>
          </div>
        </DashboardCard>

        <DashboardCard title="Priority Tasks" className="lg:col-span-2">
          {/* ...priority tasks content... */}
        </DashboardCard>
      </div>

      {/* Recent Applications */}
      <DashboardCard title="Recent Applications">
        {recentApplications.length > 0 ? (
          <div className="mt-4">
            <div className="hidden lg:block">
              <Table
                columns={recentApplicationsColumns}
                data={recentApplications}
              />
            </div>
            <div className="lg:hidden space-y-4">
              {recentApplications.map((app, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 break-words">
                        {app.applicant?.firstName}{" "}
                        {app.applicant?.lastName || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-500 break-all">
                        {app.applicant?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Submitted:</p>
                      <p className="text-sm font-medium">
                        {formatDate(app.createdAt)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {app.status && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Status:</p>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              app.status,
                            )}`}
                          >
                            {app.status?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {app.result && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Demo Result:
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                              app.result,
                            )}`}
                          >
                            {app.result?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {app.result?.toLowerCase() === "pass" &&
                        app.interviewResult && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Interview Result:
                            </p>
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                                app.interviewResult,
                              )}`}
                            >
                              {app.interviewResult?.toUpperCase()}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() =>
                        handleQuickAction("view-application", app.id)
                      }
                      variant="outline"
                      size="sm"
                      className="w-full"
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

      <ApplicationDetailsModal
        isOpen={showModal}
        application={selectedApplication}
        onClose={() => {
          setShowModal(false);
          setSelectedApplication(null);
        }}
        onGoToReview={(app) => {
          setShowModal(false);
          setSelectedApplication(null);
          navigate("/hr/review");
        }}
      />
    </div>
  );
};

export default HRDashboard;
