import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import ApplicationDetailsModal from "../../components/ApplicationDetailsModal";
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
          {applicationHistory.map((application) => {
            const demoResult = application.result;
            const initialResult = application.initialInterviewResult;
            const finalResult = application.finalInterviewResult;

            return (
              <DashboardCard
                key={application.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Attempt #{application.attemptNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                          application.status,
                        )}`}
                      >
                        {application.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 mb-3">
                      {demoResult && (
                        <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start sm:gap-2">
                          <span className="text-sm text-gray-500">
                            Demo Result:
                          </span>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getResultColor(
                              demoResult,
                            )}`}
                          >
                            {demoResult?.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {initialResult && (
                        <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start sm:gap-2">
                          <span className="text-sm text-gray-500">
                            Initial Interview Result:
                          </span>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getResultColor(
                              initialResult,
                            )}`}
                          >
                            {initialResult?.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {finalResult && (
                        <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start sm:gap-2">
                          <span className="text-sm text-gray-500">
                            Final Interview Result:
                          </span>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getResultColor(
                              finalResult,
                            )}`}
                          >
                            {finalResult?.toUpperCase()}
                          </span>
                        </div>
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

                    {/* Rejection Reason */}
                    {application.status === "REJECTED" &&
                      application.hrNotes && (
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

                    {application.status === "completed" &&
                      application.score && (
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
            );
          })}
        </div>
      )}

      {/* Application Detail Modal */}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          isOpen={!!selectedApplication}
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
};

export default ApplicationHistory;
