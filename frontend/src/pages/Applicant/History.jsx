import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import { formatDate } from "../../utils/formatDate";
import { applicationApi } from "../../api/applicationApi";

const ApplicationHistory = () => {
  const { applicationHistory, getApplicationHistory, loading, error } =
    useApplicationStore();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [downloadingDoc, setDownloadingDoc] = useState(null);

  useEffect(() => {
    getApplicationHistory();
  }, [getApplicationHistory]);

  const downloadDocument = async (applicationId, documentIndex) => {
    setDownloadingDoc(documentIndex);
    try {
      await applicationApi.downloadDocument(applicationId, documentIndex);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document. Please try again.");
    } finally {
      setDownloadingDoc(null);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Application History
        </h1>
        <p className="text-gray-600">
          View all your previous teaching applications and their outcomes.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Applications List */}
      {!applicationHistory || applicationHistory.length === 0 ? (
        <DashboardCard title="No Applications Found">
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <p className="text-gray-500 mb-4">
              You haven't submitted any applications yet.
            </p>
            <Button
              onClick={() =>
                (window.location.href = "/applicant/application/new")
              }
              variant="primary"
            >
              Create Your First Application
            </Button>
          </div>
        </DashboardCard>
      ) : (
        <div className="space-y-6">
          {applicationHistory.map((application) => (
            <DashboardCard
              key={application.id}
              className="hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Attempt #{application.attemptNumber}
                    </h3>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status?.toUpperCase()}
                    </span>
                    {application.result && (
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getResultColor(
                          application.result
                        )}`}
                      >
                        {application.result?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Submitted:</p>
                      <p className="font-medium">
                        {formatDate(application.createdAt)}
                      </p>
                    </div>
                    {application.status === "completed" &&
                      application.score && (
                        <div>
                          <p className="text-gray-500">Final Score:</p>
                          <p className="font-medium text-lg">
                            {application.score.total}%
                          </p>
                        </div>
                      )}
                  </div>

                  {/* Demo Schedule Info */}
                  {application.demoSchedule && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-500 text-sm mb-1">
                        DEMONSTRATION DETAILS:
                      </p>
                      <p className="text-sm">
                        {formatDate(application.demoSchedule)}
                      </p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {application.status === "REJECTED" && application.hrNotes && (
                    <div className="mt-3 pt-3 border-t border-red-200 bg-red-50 rounded-md p-3">
                      <div className="flex items-start">
                        <svg
                          className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <p className="text-xs font-semibold text-red-900 mb-0.5">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-800">
                            {application.hrNotes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                  <Button
                    onClick={() => setSelectedApplication(application)}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>

                  {application.status === "completed" && application.score && (
                    <Button
                      onClick={() =>
                        (window.location.href = `/applicant/application/${application.id}/results`)
                      }
                      variant="outline"
                      size="sm"
                    >
                      View Scores
                    </Button>
                  )}
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Application Details - Attempt #
                  {selectedApplication.attemptNumber}
                </h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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

              <div className="space-y-6">
                {/* Status Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Application Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Status</p>
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                          selectedApplication.status
                        )}`}
                      >
                        {selectedApplication.status?.toUpperCase()}
                      </span>
                    </div>
                    {selectedApplication.result && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Result</p>
                        <span
                          className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getResultColor(
                            selectedApplication.result
                          )}`}
                        >
                          {selectedApplication.result?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Application ID</p>
                      <p className="mt-1 font-medium">
                        #{selectedApplication.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Attempt Number</p>
                      <p className="mt-1 font-medium">
                        #{selectedApplication.attemptNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted Date</p>
                      <p className="mt-1 font-medium">
                        {formatDate(selectedApplication.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="mt-1 font-medium">
                        {formatDate(selectedApplication.updatedAt)}
                      </p>
                    </div>
                    {selectedApplication.totalScore && (
                      <div>
                        <p className="text-sm text-gray-500">Total Score</p>
                        <p className="mt-1 font-medium text-lg text-blue-600">
                          {selectedApplication.totalScore}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Demo Schedule Section */}
                {selectedApplication.demoSchedule && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Demo Schedule
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-700">Date & Time</p>
                          <p className="mt-1 font-medium text-blue-900">
                            {formatDate(selectedApplication.demoSchedule)}
                          </p>
                          <p className="text-sm text-blue-800">
                            {selectedApplication.demoTime || "Time not set"}
                          </p>
                        </div>
                        {selectedApplication.demoDuration && (
                          <div>
                            <p className="text-sm text-blue-700">Duration</p>
                            <p className="mt-1 font-medium text-blue-900">
                              {selectedApplication.demoDuration} minutes
                            </p>
                          </div>
                        )}
                        {selectedApplication.demoLocation && (
                          <div className="col-span-2">
                            <p className="text-sm text-blue-700">Location</p>
                            <p className="mt-1 font-medium text-blue-900">
                              {selectedApplication.demoLocation}
                            </p>
                          </div>
                        )}
                        {selectedApplication.demoNotes && (
                          <div className="col-span-2">
                            <p className="text-sm text-blue-700 mb-1">
                              Instructions
                            </p>
                            <p className="text-sm text-blue-800 bg-white rounded p-2">
                              {selectedApplication.demoNotes}
                            </p>
                          </div>
                        )}
                        {selectedApplication.demoRescheduleReason && (
                          <div className="col-span-2">
                            <p className="text-sm text-blue-700 mb-1">
                              Reschedule Reason
                            </p>
                            <p className="text-sm text-blue-800 bg-white rounded p-2">
                              {selectedApplication.demoRescheduleReason ===
                              "APPLICANT_NO_SHOW"
                                ? "Applicant did not appear on scheduled demo"
                                : selectedApplication.demoRescheduleReason ===
                                  "SCHOOL"
                                ? "Rescheduled by school"
                                : selectedApplication.demoRescheduleReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedApplication.status === "REJECTED" &&
                  selectedApplication.hrNotes && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Rejection Information
                      </h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
                              Reason for Rejection
                            </h4>
                            <p className="text-sm text-red-800">
                              {selectedApplication.hrNotes}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Additional Information */}
                {(selectedApplication.education ||
                  selectedApplication.experience ||
                  selectedApplication.motivation) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Additional Information
                    </h3>
                    <div className="space-y-3">
                      {selectedApplication.education && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Educational Background
                          </p>
                          <p className="mt-1 text-sm text-gray-700 bg-gray-50 rounded p-2">
                            {selectedApplication.education}
                          </p>
                        </div>
                      )}

                      {selectedApplication.experience && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Teaching Experience
                          </p>
                          <p className="mt-1 text-sm text-gray-700 bg-gray-50 rounded p-2">
                            {selectedApplication.experience}
                          </p>
                        </div>
                      )}

                      {selectedApplication.motivation && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Motivation
                          </p>
                          <p className="mt-1 text-sm text-gray-700 bg-gray-50 rounded p-2">
                            {selectedApplication.motivation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assessment Score */}
                {selectedApplication.score && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Assessment Score
                    </h3>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                      <div className="text-center mb-4">
                        <p className="text-4xl font-bold text-blue-600">
                          {selectedApplication.score.total}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Overall Score
                        </p>
                      </div>
                      {selectedApplication.score.breakdown && (
                        <div className="space-y-2 border-t border-blue-200 pt-4">
                          {Object.entries(
                            selectedApplication.score.breakdown
                          ).map(([criteria, score]) => (
                            <div
                              key={criteria}
                              className="flex justify-between items-center bg-white rounded px-3 py-2"
                            >
                              <span className="text-sm capitalize text-gray-700">
                                {criteria.replace("_", " ")}
                              </span>
                              <span className="font-semibold text-blue-600">
                                {score}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {selectedApplication.documents &&
                  (() => {
                    try {
                      const docs =
                        typeof selectedApplication.documents === "string"
                          ? JSON.parse(selectedApplication.documents)
                          : selectedApplication.documents;

                      if (Array.isArray(docs) && docs.length > 0) {
                        return (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                              Submitted Documents
                            </h3>
                            <div className="space-y-2">
                              {docs.map((doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <div className="flex-shrink-0">
                                      <svg
                                        className="w-8 h-8 text-blue-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {doc.fileName ||
                                          doc.originalName ||
                                          `Document ${index + 1}`}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {doc.mimetype || "Unknown type"}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() =>
                                      downloadDocument(
                                        selectedApplication.id,
                                        index
                                      )
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="ml-2 flex-shrink-0"
                                    disabled={downloadingDoc === index}
                                  >
                                    {downloadingDoc === index ? (
                                      <>
                                        <svg
                                          className="animate-spin w-4 h-4 mr-1"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                        Downloading...
                                      </>
                                    ) : (
                                      <>
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                          />
                                        </svg>
                                        Download
                                      </>
                                    )}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    } catch (e) {
                      console.error("Error parsing documents:", e);
                    }
                    return null;
                  })()}
              </div>

              <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                {selectedApplication.status === "completed" &&
                  selectedApplication.score && (
                    <Button
                      onClick={() => {
                        setSelectedApplication(null);
                        window.location.href = `/applicant/application/${selectedApplication.id}/results`;
                      }}
                      variant="primary"
                    >
                      View Full Scores
                    </Button>
                  )}
                <Button
                  onClick={() => setSelectedApplication(null)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationHistory;
