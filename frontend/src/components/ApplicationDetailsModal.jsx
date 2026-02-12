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
                  application.status,
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
                    application.result,
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
                      application.interviewResult,
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
              <p className="text-sm text-gray-500">Program</p>
              <p className="mt-1 font-medium">{application.program || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Specialization</p>
              <p className="mt-1 font-medium">
                {application.specialization?.name ||
                  application.subjectSpecialization ||
                  application.subject_specialization ||
                  "N/A"}
              </p>
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

        {/* Educational Background */}
        {(application.education || application.educationalBackground) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Educational Background
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {application.education || application.educationalBackground}
              </p>
            </div>
          </div>
        )}

        {/* Teaching Experience */}
        {(application.experience || application.teachingExperience) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Teaching Experience
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {application.experience || application.teachingExperience}
              </p>
            </div>
          </div>
        )}

        {/* Motivation */}
        {application.motivation && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Motivation
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {application.motivation}
              </p>
            </div>
          </div>
        )}

        {/* Documents */}
        {application.documents && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Uploaded Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                let docs = [];
                try {
                  docs = Array.isArray(application.documents)
                    ? application.documents
                    : JSON.parse(application.documents);
                } catch (e) {
                  console.error("Failed to parse parsing documents", e);
                }

                if (docs.length === 0) {
                  return (
                    <p className="text-sm text-gray-500">
                      No documents uploaded.
                    </p>
                  );
                }

                return docs.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-100"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {typeof doc === "object"
                          ? doc.fileName || doc.name
                          : doc}
                      </p>
                      <p className="text-xs text-gray-500">
                        {typeof doc === "object"
                          ? `${doc.mimetype || "File"} • ${(
                              (doc.size || 0) / 1024
                            ).toFixed(1)} KB`
                          : "Document"}
                      </p>
                    </div>
                    {/* Add download button if URL exists */}
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        title="Download"
                      >
                        <svg
                          className="w-5 h-5"
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
                      </a>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

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
                      application.result,
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
                      application.interviewResult,
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
