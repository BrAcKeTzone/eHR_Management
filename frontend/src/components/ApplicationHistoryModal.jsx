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
            {applicationHistory.map((app) => {
              const demoResult = app.result;
              const initialResult = app.initialInterviewResult;
              const finalResult = app.finalInterviewResult;

              return (
                <div
                  key={app.id}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Attempt #{app.attemptNumber}
                      </h4>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                        {app.specialization?.name ||
                          app.subjectSpecialization ||
                          app.subject_specialization ||
                          "N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full w-fit ${getStatusColor(
                        app.status,
                      )}`}
                    >
                      {app.status?.toUpperCase()}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Submitted:</p>
                      <p className="font-medium">{formatDate(app.createdAt)}</p>
                    </div>
                    {app.status === "completed" && app.score && (
                      <div>
                        <p className="text-gray-500">Final Score:</p>
                        <p className="font-medium">{app.score.total}%</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
