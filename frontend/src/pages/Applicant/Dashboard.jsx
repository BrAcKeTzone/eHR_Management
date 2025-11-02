import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useApplicationStore } from "../../store/applicationStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/formatDate";

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { applicationHistory, loading, error, getApplicationHistory } =
    useApplicationStore();

  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Use applicationHistory for applicant's own applications
  const userApplications = applicationHistory || [];

  // Get current (most recent) application
  const currentApplication =
    userApplications.length > 0
      ? userApplications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0]
      : null;

  useEffect(() => {
    // Applicants should use getApplicationHistory, not fetchApplications
    getApplicationHistory();

    // Show success message if redirected from form submission
    if (location.state?.message) {
      setShowSuccessMessage(true);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [getApplicationHistory, location.state]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "yellow";
      case "under review":
        return "blue";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "completed":
        return "green";
      default:
        return "gray";
    }
  };

  const getApplicationProgress = (status) => {
    const stages = ["Submitted", "Under Review", "Demo Scheduled", "Completed"];
    const statusMapping = {
      pending: 0,
      "under review": 1,
      approved: 2,
      completed: 3,
    };

    const currentIndex = statusMapping[status?.toLowerCase()] || 0;
    const percentage = Math.round(((currentIndex + 1) / stages.length) * 100);

    return { stages, currentIndex, percentage };
  };

  const canCreateNewApplication = () => {
    return (
      !currentApplication ||
      ["rejected", "completed"].includes(
        currentApplication.status?.toLowerCase()
      )
    );
  };

  const getUpcomingDemo = () => {
    if (!currentApplication?.demoSchedule) return null;

    // Backend returns demoSchedule as ISO DateTime string
    const demoDate = new Date(currentApplication.demoSchedule);
    const now = new Date();

    if (demoDate > now) {
      return {
        date: currentApplication.demoSchedule,
        time: currentApplication.demoTime || "Time not set",
        location: currentApplication.demoLocation,
        duration: currentApplication.demoDuration,
        notes: currentApplication.demoNotes,
      };
    }
    return null;
  };

  const upcomingDemo = getUpcomingDemo();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {location.state?.message || "Application submitted successfully!"}
          </div>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className="text-green-700 hover:text-green-900"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name || "Applicant"}!
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
            <div className="ml-4 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Applications
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {userApplications.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Pending
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {
                  userApplications.filter(
                    (app) => app.status?.toLowerCase() === "pending"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Approved
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {
                  userApplications.filter((app) =>
                    ["approved", "completed"].includes(
                      app.status?.toLowerCase()
                    )
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Application Status */}
        <DashboardCard title="Current Application" className="lg:col-span-2">
          {currentApplication ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentApplication.position}
                  </h3>
                </div>
                <StatusBadge
                  status={currentApplication.status}
                  variant={getStatusColor(currentApplication.status)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Application ID:</p>
                  <p className="font-medium">#{currentApplication.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Submitted:</p>
                  <p className="font-medium">
                    {formatDate(currentApplication.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Last Updated:</p>
                  <p className="font-medium">
                    {formatDate(currentApplication.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Application Progress</span>
                  <span>
                    {
                      getApplicationProgress(currentApplication.status)
                        .percentage
                    }
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        getApplicationProgress(currentApplication.status)
                          .percentage
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  {getApplicationProgress(currentApplication.status).stages.map(
                    (stage, index) => (
                      <span
                        key={stage}
                        className={
                          index <=
                          getApplicationProgress(currentApplication.status)
                            .currentIndex
                            ? "text-blue-600 font-medium"
                            : ""
                        }
                      >
                        {stage}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Rejection Reason */}
              {currentApplication.status === "REJECTED" &&
                currentApplication.hrNotes && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-900 mb-1">
                          Rejection Reason
                        </h4>
                        <p className="text-sm text-red-800">
                          {currentApplication.hrNotes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              <div className="flex space-x-3">
                <Button
                  onClick={() => navigate("/applicant/history")}
                  variant="outline"
                  size="sm"
                >
                  View Details
                </Button>
                {currentApplication.status?.toLowerCase() === "completed" &&
                  currentApplication.scores && (
                    <Button
                      onClick={() =>
                        navigate(`/applicant/results/${currentApplication.id}`)
                      }
                      variant="outline"
                      size="sm"
                    >
                      View Results
                    </Button>
                  )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Active Application
              </h3>
              <p className="text-gray-500 mb-4">
                You haven't submitted any applications yet.
              </p>
              <Button
                onClick={() => navigate("/applicant/application")}
                variant="primary"
              >
                Submit New Application
              </Button>
            </div>
          )}
        </DashboardCard>

        {/* Demo Schedule */}
        {currentApplication?.status?.toLowerCase() !== "completed" && (
          <DashboardCard title="Upcoming Demo">
            {upcomingDemo ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-blue-600"
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
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Demo Scheduled
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Date & Time:</p>
                    <p className="font-medium">
                      {formatDate(upcomingDemo.date)}
                    </p>
                    <p className="font-medium">{upcomingDemo.time}</p>
                  </div>
                  {upcomingDemo.duration && (
                    <div>
                      <p className="text-gray-600">Duration:</p>
                      <p className="font-medium">
                        {upcomingDemo.duration} minutes
                      </p>
                    </div>
                  )}
                  {upcomingDemo.location && (
                    <div>
                      <p className="text-gray-600">Location:</p>
                      <p className="font-medium">{upcomingDemo.location}</p>
                    </div>
                  )}
                  {upcomingDemo.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Instructions:
                      </p>
                      <p className="text-xs text-blue-800">
                        {upcomingDemo.notes}
                      </p>
                    </div>
                  )}
                  {!upcomingDemo.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-xs text-blue-800">
                        Please arrive 15 minutes early. Further details will be
                        sent via email.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : currentApplication?.status?.toLowerCase() === "approved" ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-yellow-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-yellow-600 font-medium">Schedule Pending</p>
                <p className="text-sm text-gray-500 mt-1">
                  Demo will be scheduled soon
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
                <p className="text-gray-500">No demo scheduled</p>
              </div>
            )}
          </DashboardCard>
        )}
      </div>

      {/* Assessment Results */}
      {currentApplication?.scores && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Latest Assessment Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {currentApplication.scores.overall}
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {currentApplication.scores.technical}
              </div>
              <div className="text-sm text-gray-600">Technical Skills</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {currentApplication.scores.teaching}
              </div>
              <div className="text-sm text-gray-600">Teaching Ability</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {currentApplication.scores.communication}
              </div>
              <div className="text-sm text-gray-600">Communication</div>
            </div>
          </div>
          {currentApplication.scores.comments && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                Evaluator Comments
              </h4>
              <p className="text-sm text-gray-700">
                {currentApplication.scores.comments}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {canCreateNewApplication() ? (
            <Button
              onClick={() => navigate("/applicant/application")}
              variant="primary"
              className="flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Application
            </Button>
          ) : (
            <Button
              disabled
              title={
                currentApplication?.status
                  ? `You have a ${currentApplication.status} application`
                  : "You cannot create a new application"
              }
              variant="outline"
              className="flex items-center justify-center opacity-50 cursor-not-allowed"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              New Application
            </Button>
          )}

          <Button
            onClick={() => navigate("/applicant/history")}
            variant="outline"
            className="flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            View History
          </Button>

          <Button
            onClick={() => navigate("/applicant/profile")}
            variant="outline"
            className="flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Edit Profile
          </Button>
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
                navigate("/applicant/application");
                setShowNewApplicationModal(false);
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
