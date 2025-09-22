import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import { formatDate } from "../../utils/formatDate";

const ApplicationHistory = () => {
  const { applicationHistory, getApplicationHistory, loading, error } =
    useApplicationStore();
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    getApplicationHistory();
  }, [getApplicationHistory]);

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
                      Attempt #{application.attempt_number}
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
                      <p className="text-gray-500">Program:</p>
                      <p className="font-medium">{application.program}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Submitted:</p>
                      <p className="font-medium">
                        {formatDate(application.created_at)}
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
                  {application.demo_schedule && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-500 text-sm mb-1">
                        Demo Schedule:
                      </p>
                      <p className="text-sm">
                        {formatDate(application.demo_schedule.date)} at{" "}
                        {application.demo_schedule.time}
                        {application.demo_schedule.location &&
                          ` - ${application.demo_schedule.location}`}
                      </p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {application.status === "rejected" &&
                    application.rejection_reason && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-gray-500 text-sm mb-1">
                          Rejection Reason:
                        </p>
                        <p className="text-sm text-red-600">
                          {application.rejection_reason}
                        </p>
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

                  {application.documents &&
                    application.documents.length > 0 && (
                      <Button
                        onClick={() =>
                          (window.location.href = `/applicant/application/${application.id}/documents`)
                        }
                        variant="outline"
                        size="sm"
                      >
                        Documents
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Application Details - Attempt #
                  {selectedApplication.attempt_number}
                </h2>
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

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span
                      className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(
                        selectedApplication.status
                      )}`}
                    >
                      {selectedApplication.status?.toUpperCase()}
                    </span>
                  </div>
                  {selectedApplication.result && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Result
                      </p>
                      <span
                        className={`px-2 py-1 text-sm font-medium rounded-full ${getResultColor(
                          selectedApplication.result
                        )}`}
                      >
                        {selectedApplication.result?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Program</p>
                  <p className="mt-1">{selectedApplication.program}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Submitted Date
                  </p>
                  <p className="mt-1">
                    {formatDate(selectedApplication.created_at)}
                  </p>
                </div>

                {selectedApplication.education && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Educational Background
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      {selectedApplication.education}
                    </p>
                  </div>
                )}

                {selectedApplication.experience && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Teaching Experience
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      {selectedApplication.experience}
                    </p>
                  </div>
                )}

                {selectedApplication.motivation && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Motivation
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      {selectedApplication.motivation}
                    </p>
                  </div>
                )}

                {selectedApplication.score && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Assessment Score
                    </p>
                    <div className="mt-2 bg-gray-50 rounded-lg p-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">
                          {selectedApplication.score.total}%
                        </p>
                        <p className="text-sm text-gray-600">Overall Score</p>
                      </div>
                      {selectedApplication.score.breakdown && (
                        <div className="mt-4 space-y-2">
                          {Object.entries(
                            selectedApplication.score.breakdown
                          ).map(([criteria, score]) => (
                            <div
                              key={criteria}
                              className="flex justify-between text-sm"
                            >
                              <span className="capitalize">
                                {criteria.replace("_", " ")}
                              </span>
                              <span className="font-medium">{score}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
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
