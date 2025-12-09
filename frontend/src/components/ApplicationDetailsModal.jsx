import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { formatDate } from "../utils/formatDate";

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

const ApplicationDetailsModal = ({
  isOpen,
  application,
  onClose,
  onGoToReview,
}) => {
  if (!isOpen || !application) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Application Details - ${application.applicant?.firstName} ${application.applicant?.lastName}`}
      size="lg"
    >
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
                  application.status
                )}`}
              >
                {application.status?.toUpperCase()}
              </span>
            </div>
            {application.result && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Demo Result</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getResultColor(
                    application.result
                  )}`}
                >
                  {application.result?.toUpperCase()}
                </span>
              </div>
            )}
            {application.result?.toLowerCase() === "pass" &&
              application.interviewResult && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Interview Result</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getResultColor(
                      application.interviewResult
                    )}`}
                  >
                    {application.interviewResult?.toUpperCase()}
                  </span>
                </div>
              )}
          </div>
        </div>

        {/* Applicant Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Applicant Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Application ID</p>
              <p className="mt-1 font-medium">#{application.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Attempt Number</p>
              <p className="mt-1 font-medium">#{application.attemptNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="mt-1 font-medium">
                {application.applicant?.firstName}{" "}
                {application.applicant?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 font-medium break-all">
                {application.applicant?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="mt-1 font-medium">
                {application.applicant?.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Submitted Date</p>
              <p className="mt-1 font-medium">
                {formatDate(application.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="mt-1 font-medium">
                {formatDate(application.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Demo Schedule */}
        {application.demoSchedule && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Demo Schedule
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700">Date & Time</p>
                  <p className="mt-1 font-medium text-blue-900">
                    {formatDate(application.demoSchedule)}
                    {application.demoTime && ` at ${application.demoTime}`}
                  </p>
                </div>
                {application.demoDuration && (
                  <div>
                    <p className="text-sm text-blue-700">Duration</p>
                    <p className="mt-1 font-medium text-blue-900">
                      {application.demoDuration} minutes
                    </p>
                  </div>
                )}
                {application.demoLocation && (
                  <div className="col-span-1 sm:col-span-2">
                    <p className="text-sm text-blue-700">Location</p>
                    <p className="mt-1 font-medium text-blue-900 break-words">
                      {application.demoLocation}
                    </p>
                  </div>
                )}
                {application.demoNotes && (
                  <div className="col-span-1 sm:col-span-2">
                    <p className="text-sm text-blue-700 mb-1">Notes</p>
                    <p className="text-sm text-blue-800 bg-white rounded p-2 break-words">
                      {application.demoNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Demo Assessment */}
        {(application.totalScore || application.result) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Demo Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-green-700">Total Score</p>
                <p className="font-medium text-green-900">
                  {application.totalScore
                    ? `${application.totalScore}%`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-700">Demo Result</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                      application.result
                    )}`}
                  >
                    {application.result?.toUpperCase() || "N/A"}
                  </span>
                </div>
              </div>
              {application.hrNotes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-blue-700">Notes</p>
                  <p className="text-sm text-blue-800 bg-white rounded p-2 break-words">
                    {application.hrNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interview Schedule */}
        {application.interviewSchedule && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Interview Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-blue-700">Date & Time</p>
                <p className="font-medium text-blue-900">
                  {formatDate(application.interviewSchedule)}
                  {application.interviewTime &&
                    ` at ${application.interviewTime}`}
                </p>
              </div>
              {application.interviewLocation && (
                <div>
                  <p className="text-sm text-blue-700">Location</p>
                  <p className="font-medium text-blue-900">
                    {application.interviewLocation}
                  </p>
                </div>
              )}
              {application.interviewDuration && (
                <div>
                  <p className="text-sm text-blue-700">Duration</p>
                  <p className="font-medium text-blue-900">
                    {application.interviewDuration} minutes
                  </p>
                </div>
              )}
              {application.interviewNotes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-blue-700 mb-1">Notes</p>
                  <p className="text-sm text-blue-800 bg-white rounded p-2 break-words">
                    {application.interviewNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interview Assessment */}
        {(application.interviewResult || application.interviewNotes) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Interview Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-green-700">Interview Result</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                      application.interviewResult
                    )}`}
                  >
                    {application.interviewResult?.toUpperCase() || "N/A"}
                  </span>
                </div>
              </div>
              {application.interviewNotes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-blue-700">Notes</p>
                  <p className="text-sm text-blue-800 bg-white rounded p-2 break-words">
                    {application.interviewNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {onGoToReview && (
            <Button
              onClick={() => {
                onGoToReview(application);
              }}
              variant="primary"
              className="flex-1"
            >
              Go to Review Page
            </Button>
          )}
          <Button
            onClick={() => onClose()}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ApplicationDetailsModal;
