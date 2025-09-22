import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useApplicationStore } from "../../store/applicationStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { formatDate } from "../../utils/formatDate";

const ApplicantDashboard = () => {
  const { user } = useAuthStore();
  const { currentApplication, getCurrentApplication, loading, error } =
    useApplicationStore();

  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);

  useEffect(() => {
    getCurrentApplication();
  }, [getCurrentApplication]);

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

  const canCreateNewApplication = () => {
    return !currentApplication || currentApplication.status === "rejected";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Track your teaching application progress and manage your submissions.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Application Status */}
        <DashboardCard
          title="Application Status"
          className="col-span-1 md:col-span-2 lg:col-span-1"
        >
          {currentApplication ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Attempt #{currentApplication.attempt_number}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    currentApplication.status
                  )}`}
                >
                  {currentApplication.status?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Program:</p>
                <p className="font-medium">{currentApplication.program}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted:</p>
                <p className="font-medium">
                  {formatDate(currentApplication.created_at)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">No active application</p>
              {canCreateNewApplication() && (
                <Button
                  onClick={() => setShowNewApplicationModal(true)}
                  variant="primary"
                  size="sm"
                >
                  Create New Application
                </Button>
              )}
            </div>
          )}
        </DashboardCard>

        {/* Demo Schedule */}
        <DashboardCard title="Teaching Demo Schedule">
          {currentApplication?.status === "approved" &&
          currentApplication?.demo_schedule ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Date:</p>
                <p className="font-medium">
                  {formatDate(currentApplication.demo_schedule.date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time:</p>
                <p className="font-medium">
                  {currentApplication.demo_schedule.time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location:</p>
                <p className="font-medium">
                  {currentApplication.demo_schedule.location || "TBA"}
                </p>
              </div>
            </div>
          ) : currentApplication?.status === "approved" ? (
            <div className="text-center py-4">
              <p className="text-yellow-600">Schedule will be assigned soon</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No demo scheduled</p>
            </div>
          )}
        </DashboardCard>

        {/* Results */}
        <DashboardCard title="Assessment Results">
          {currentApplication?.status === "completed" &&
          currentApplication?.score ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Score:</p>
                <p className="text-2xl font-bold">
                  {currentApplication.score.total}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Result:</p>
                <span
                  className={`px-2 py-1 text-sm font-medium rounded-full ${
                    currentApplication.result === "pass"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {currentApplication.result?.toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Results pending</p>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {canCreateNewApplication() && (
            <Button
              onClick={() => setShowNewApplicationModal(true)}
              variant="primary"
            >
              Create New Application
            </Button>
          )}
          <Button
            onClick={() => (window.location.href = "/applicant/history")}
            variant="outline"
          >
            View Application History
          </Button>
          {currentApplication?.status === "completed" && (
            <Button
              onClick={() =>
                (window.location.href = `/applicant/application/${currentApplication.id}/results`)
              }
              variant="outline"
            >
              View Detailed Results
            </Button>
          )}
        </div>
      </div>

      {/* New Application Modal */}
      <Modal
        isOpen={showNewApplicationModal}
        onClose={() => setShowNewApplicationModal(false)}
        title="Create New Application"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You're about to create a new teaching application. This will start a
            new application process.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowNewApplicationModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                window.location.href = "/applicant/application/new";
              }}
              variant="primary"
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApplicantDashboard;
