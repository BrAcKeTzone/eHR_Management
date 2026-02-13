import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { formatDate } from "../utils/formatDate";

const ApplicationHistoryModal = ({
  isOpen,
  onClose,
  selectedApplication,
  applicationHistory,
}) => {
  // Handle both application and user objects
  const applicant = selectedApplication?.applicant || selectedApplication;

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

  if (!isOpen || !selectedApplication) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Application History - ${applicant?.firstName} ${applicant?.lastName}`}
      size="large"
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="text-sm text-gray-600 break-words">
          All applications from {applicant?.email}
        </div>

        {applicationHistory && applicationHistory.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {applicationHistory.map((app) => (
              <div
                key={app.id}
                className="border border-gray-200 rounded-lg p-3 sm:p-4"
              >
                {/* Attempt # and Status */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                  <h4 className="font-medium text-gray-900">
                    Attempt #{app.attemptNumber}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getStatusColor(
                      app.status,
                    )}`}
                  >
                    {app.status?.toUpperCase()}
                  </span>
                </div>

                {/* Specialization */}
                {app.specialization && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Specialization</p>
                    <p className="text-sm font-medium text-gray-900">
                      {app.specialization.name}
                    </p>
                  </div>
                )}

                {/* Demo and Interview Schedule/Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Demo Schedule and Result */}
                  <div className="space-y-3">
                    {app.demoSchedule && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Demo Schedule
                        </p>
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {formatDate(app.demoSchedule)}
                        </p>
                      </div>
                    )}
                    {app.result && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Demo Result
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
                  </div>

                  {/* Interview Schedule and Result */}
                  <div className="space-y-3">
                    {app.interviewSchedule && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Interview Schedule
                        </p>
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {formatDate(app.interviewSchedule)}
                        </p>
                      </div>
                    )}
                    {app.interviewResult && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Interview Result
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-500">
              No application history found for this applicant.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ApplicationHistoryModal;
