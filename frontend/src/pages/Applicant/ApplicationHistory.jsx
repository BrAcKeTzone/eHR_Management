import React, { useState, useEffect } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import { useAuthStore } from "../../store/authStore";
import StatusBadge from "../../components/StatusBadge";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";

const ApplicationHistory = () => {
  const { user } = useAuthStore();
  const { applications, loading, fetchApplications } = useApplicationStore();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    console.log("ApplicationHistory: useEffect running", {
      user,
      applications,
    });
    fetchApplications()
      .then((result) => {
        console.log("fetchApplications result:", result);
      })
      .catch((error) => {
        console.error("fetchApplications error:", error);
      });
  }, [fetchApplications]);

  // Show all applications for now (for testing/demo purposes)
  // Later this can be filtered by user: apps.filter(app => app.applicant_email === user?.email)
  const userApplications = applications;

  console.log("ApplicationHistory render:", {
    applications,
    userApplications,
    loading,
    applicationsLength: applications?.length,
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getApplicationProgress = (status) => {
    const stages = ["Submitted", "Under Review", "Demo Scheduled", "Completed"];
    const currentIndex = stages.findIndex(
      (stage) =>
        stage.toLowerCase().includes(status.toLowerCase()) ||
        status.toLowerCase().includes(stage.toLowerCase())
    );
    return { stages, currentIndex: currentIndex >= 0 ? currentIndex : 0 };
  };

  const renderApplicationCard = (application) => (
    <div
      key={application.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedApplication(application)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {application.program}
          </h3>
          <p className="text-sm text-gray-600">
            {application.subject_specialization ||
              application.subjectSpecialization ||
              "Teaching Position"}
          </p>
        </div>
        <StatusBadge
          status={application.status}
          variant={getStatusColor(application.status)}
        />
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Application ID:</span>
          <span className="font-medium text-gray-900">#{application.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Submitted:</span>
          <span className="text-gray-900">
            {formatDate(application.created_at || application.submittedAt)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Last Updated:</span>
          <span className="text-gray-900">
            {formatDate(application.updated_at || application.updatedAt)}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>
            {Math.round(
              ((getApplicationProgress(application.status).currentIndex + 1) /
                4) *
                100
            )}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((getApplicationProgress(application.status).currentIndex + 1) /
                  4) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Quick Info */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">
          {Array.isArray(application.documents)
            ? application.documents.length
            : 0}{" "}
          documents uploaded
        </span>
        <span className="text-blue-600 font-medium">View Details →</span>
      </div>
    </div>
  );

  const renderApplicationRow = (application) => (
    <tr
      key={application.id}
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => setSelectedApplication(application)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            #{application.id}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(application.created_at || application.submittedAt)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {application.program}
          </div>
          <div className="text-sm text-gray-500">
            {application.subject_specialization ||
              application.subjectSpecialization ||
              "Teaching Position"}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge
          status={application.status}
          variant={getStatusColor(application.status)}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(application.updated_at || application.updatedAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${
                  ((getApplicationProgress(application.status).currentIndex +
                    1) /
                    4) *
                  100
                }%`,
              }}
            />
          </div>
          <span className="text-gray-600">
            {Math.round(
              ((getApplicationProgress(application.status).currentIndex + 1) /
                4) *
                100
            )}
            %
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <span className="text-blue-600 hover:text-blue-900">View</span>
      </td>
    </tr>
  );

  const renderApplicationDetail = () => {
    if (!selectedApplication) return null;

    const { stages, currentIndex } = getApplicationProgress(
      selectedApplication.status
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Application Details
              </h2>
              <p className="text-sm text-gray-600">
                Application #{selectedApplication.id}
              </p>
            </div>
            <button
              onClick={() => setSelectedApplication(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
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

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="p-6 space-y-6">
              {/* Status Progress */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Application Progress
                </h3>
                <div className="flex items-center justify-between mb-4">
                  {stages.map((stage, index) => (
                    <div key={stage} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index <= currentIndex
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {index < currentIndex ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs text-center ${
                          index <= currentIndex
                            ? "text-blue-600 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {stage}
                      </span>
                      {index < stages.length - 1 && (
                        <div
                          className={`absolute w-16 h-1 mt-4 ${
                            index < currentIndex ? "bg-blue-600" : "bg-gray-200"
                          }`}
                          style={{
                            left: `${(index + 1) * 25}%`,
                            transform: "translateX(-50%)",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Application Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Program
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedApplication.program}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Subject Specialization
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedApplication.subject_specialization ||
                          selectedApplication.subjectSpecialization ||
                          "Teaching Position"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <StatusBadge
                        status={selectedApplication.status}
                        variant={getStatusColor(selectedApplication.status)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Submitted
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(
                          selectedApplication.created_at ||
                            selectedApplication.submittedAt
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Updated
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(
                          selectedApplication.updated_at ||
                            selectedApplication.updatedAt
                        )}
                      </p>
                    </div>
                    {(selectedApplication.demo_schedule ||
                      selectedApplication.demoSchedule) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Demo Schedule
                        </label>
                        {(() => {
                          const schedule =
                            selectedApplication.demo_schedule ||
                            selectedApplication.demoSchedule;
                          return (
                            <>
                              <p className="text-sm text-gray-900">
                                {formatDate(schedule.date)} at {schedule.time}
                              </p>
                              {schedule.location && (
                                <p className="text-xs text-gray-600">
                                  {schedule.location}
                                </p>
                              )}
                              {schedule.notes && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Note: {schedule.notes}
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Educational Background */}
              {(selectedApplication.education ||
                selectedApplication.educationalBackground) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Educational Background
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                    {selectedApplication.education ||
                      selectedApplication.educationalBackground}
                  </p>
                </div>
              )}

              {/* Teaching Experience */}
              {(selectedApplication.experience ||
                selectedApplication.teachingExperience) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Teaching Experience
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                    {selectedApplication.experience ||
                      selectedApplication.teachingExperience}
                  </p>
                </div>
              )}

              {/* Motivation */}
              {selectedApplication.motivation && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Motivation
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                    {selectedApplication.motivation}
                  </p>
                </div>
              )}

              {/* Documents */}
              {selectedApplication.documents &&
                Array.isArray(selectedApplication.documents) &&
                selectedApplication.documents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Uploaded Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedApplication.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-gray-50 rounded-md"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {typeof doc === "object" ? doc.name : doc}
                            </p>
                            <p className="text-xs text-gray-500">
                              {typeof doc === "object"
                                ? `${doc.type} - ${(doc.size / 1024).toFixed(
                                    1
                                  )} KB`
                                : "Uploaded document"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Scores */}
              {(selectedApplication.scores ||
                selectedApplication.total_score) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Evaluation Scores
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {selectedApplication.total_score && (
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-blue-600">
                          {selectedApplication.total_score}
                        </div>
                        <div className="text-sm text-gray-600">Total Score</div>
                      </div>
                    )}
                    {selectedApplication.scores &&
                      Array.isArray(selectedApplication.scores) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {selectedApplication.scores.map((score, index) => (
                            <div key={index} className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {score.score}
                              </div>
                              <div className="text-sm text-gray-600 capitalize">
                                {score.criteria_id.replace(/_/g, " ")}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    {selectedApplication.feedback && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Evaluator Feedback
                        </label>
                        <p className="text-sm text-gray-700">
                          {selectedApplication.feedback}
                        </p>
                      </div>
                    )}
                    {selectedApplication.rejection_reason && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason
                        </label>
                        <p className="text-sm text-red-700">
                          {selectedApplication.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <Button
              onClick={() => setSelectedApplication(null)}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Application History
          </h1>
          <p className="text-gray-600 mt-1">
            View all your teaching applications and their current status
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              List
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {userApplications.length} application
            {userApplications.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Content */}
      {userApplications.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No applications yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't submitted any teaching applications.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => (window.location.href = "/applicant/application")}
              variant="primary"
            >
              Submit New Application
            </Button>
          </div>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userApplications.map(renderApplicationCard)}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program & Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userApplications.map(renderApplicationRow)}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Application Detail Modal */}
      {renderApplicationDetail()}
    </div>
  );
};

export default ApplicationHistory;
