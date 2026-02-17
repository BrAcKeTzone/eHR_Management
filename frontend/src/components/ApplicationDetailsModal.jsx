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

const getFileNameFromUrl = (url = "", fallback = "file.pdf") => {
  try {
    const cleanUrl = url.split("?")[0];
    const name = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
    return name || fallback;
  } catch (err) {
    console.error("Failed to derive filename", err);
    return fallback;
  }
};

const handleDownloadFile = async (e, url, fallbackName) => {
  e.preventDefault();
  if (!url) return;

  const filename = getFileNameFromUrl(url, fallbackName || "file.pdf");

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download failed; opening in new tab", err);
    window.open(url, "_blank", "noopener,noreferrer");
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            {application.initialInterviewResult && (
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Initial Interview Result
                </p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getResultColor(
                    application.initialInterviewResult,
                  )}`}
                >
                  {application.initialInterviewResult?.toUpperCase()}
                </span>
              </div>
            )}
            {application.finalInterviewResult && (
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Final Interview Result
                </p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getResultColor(
                    application.finalInterviewResult,
                  )}`}
                >
                  {application.finalInterviewResult?.toUpperCase()}
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
          {/* Profile Picture */}
          <div className="mb-4 flex justify-center">
            {application.applicant?.profilePicture ? (
              <div className="flex flex-col items-center">
                <img
                  src={application.applicant.profilePicture}
                  alt={`${application.applicant?.firstName} ${application.applicant?.lastName}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 shadow-md"
                />
                <p className="mt-2 text-sm font-semibold text-gray-700 text-center">
                  {application.applicant?.firstName}{" "}
                  {application.applicant?.lastName}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300 shadow-md">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-700 text-center">
                  {application.applicant?.firstName}{" "}
                  {application.applicant?.lastName}
                </p>
              </div>
            )}
          </div>
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

        {/* Personal Information */}
        {(application.applicant?.civilStatus ||
          application.applicant?.houseNo ||
          application.applicant?.street ||
          application.applicant?.barangay ||
          application.applicant?.city ||
          application.applicant?.province ||
          application.applicant?.zipCode) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {application.applicant?.civilStatus && (
                <div>
                  <p className="text-sm text-gray-500">Civil Status</p>
                  <p className="mt-1 font-medium">
                    {application.applicant.civilStatus}
                  </p>
                </div>
              )}
            </div>
            {(application.applicant?.houseNo ||
              application.applicant?.street ||
              application.applicant?.barangay ||
              application.applicant?.city ||
              application.applicant?.province ||
              application.applicant?.zipCode) && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Address
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {application.applicant?.houseNo && (
                    <div>
                      <p className="text-sm text-gray-500">House No.</p>
                      <p className="mt-1 font-medium">
                        {application.applicant.houseNo}
                      </p>
                    </div>
                  )}
                  {application.applicant?.street && (
                    <div>
                      <p className="text-sm text-gray-500">Street</p>
                      <p className="mt-1 font-medium">
                        {application.applicant.street}
                      </p>
                    </div>
                  )}
                  {application.applicant?.barangay && (
                    <div>
                      <p className="text-sm text-gray-500">Barangay</p>
                      <p className="mt-1 font-medium">
                        {application.applicant.barangay}
                      </p>
                    </div>
                  )}
                  {application.applicant?.city && (
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="mt-1 font-medium">
                        {application.applicant.city}
                      </p>
                    </div>
                  )}
                  {application.applicant?.province && (
                    <div>
                      <p className="text-sm text-gray-500">Province</p>
                      <p className="mt-1 font-medium">
                        {application.applicant.province}
                      </p>
                    </div>
                  )}
                  {application.applicant?.zipCode && (
                    <div>
                      <p className="text-sm text-gray-500">Zip Code</p>
                      <p className="mt-1 font-medium">
                        {application.applicant.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
        {(application.education ||
          application.educationalBackground ||
          application.applicant?.education) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Educational Background
            </h3>
            <div className="space-y-3">
              {/* Complex JSON education from user profile */}
              {application.applicant?.education &&
                (() => {
                  let eduList = [];
                  try {
                    eduList = Array.isArray(application.applicant.education)
                      ? application.applicant.education
                      : JSON.parse(application.applicant.education);
                  } catch (e) {
                    return null;
                  }

                  if (Array.isArray(eduList) && eduList.length > 0) {
                    return eduList.map((edu, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <p className="text-sm text-gray-500">School</p>
                            <p className="mt-1 font-medium">
                              {edu.school || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Course/Strand
                            </p>
                            <p className="mt-1 font-medium">
                              {edu.course || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Year Graduated
                            </p>
                            <p className="mt-1 font-medium">
                              {edu.yearGraduated || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ));
                  }
                  return null;
                })()}

              {/* Legacy text-based education from application form */}
              {(application.education || application.educationalBackground) && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {application.education || application.educationalBackground}
                  </p>
                </div>
              )}
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

        {/* References */}
        {application.applicant?.references && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              References
            </h3>
            <div className="space-y-3">
              {(() => {
                let refs = [];
                try {
                  refs = Array.isArray(application.applicant.references)
                    ? application.applicant.references
                    : JSON.parse(application.applicant.references);
                } catch (e) {
                  console.error("Failed to parse references", e);
                  return (
                    <p className="text-sm text-gray-500">
                      Unable to parse references
                    </p>
                  );
                }

                if (!Array.isArray(refs) || refs.length === 0) {
                  return (
                    <p className="text-sm text-gray-500">
                      No references provided.
                    </p>
                  );
                }

                return refs.map((ref, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ref.name && (
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="mt-1 font-medium">{ref.name}</p>
                        </div>
                      )}
                      {ref.relationship && (
                        <div>
                          <p className="text-sm text-gray-500">Relationship</p>
                          <p className="mt-1 font-medium">{ref.relationship}</p>
                        </div>
                      )}
                      {ref.contactNo && (
                        <div>
                          <p className="text-sm text-gray-500">Contact No.</p>
                          <p className="mt-1 font-medium">{ref.contactNo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
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
                        onClick={(e) =>
                          handleDownloadFile(
                            e,
                            doc.url,
                            doc.fileName || doc.name || "document.pdf",
                          )
                        }
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

        {/* Initial Interview Schedule */}
        {application.initialInterviewSchedule && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Initial Interview Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-blue-700">Date & Time</p>
                <p className="font-medium text-blue-900">
                  {formatDate(application.initialInterviewSchedule)}
                  {application.initialInterviewTime &&
                    ` at ${application.initialInterviewTime}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Initial Interview Assessment */}
        {(application.initialInterviewResult ||
          application.initialInterviewFeedback) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Initial Interview Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-green-700">Result</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                      application.initialInterviewResult,
                    )}`}
                  >
                    {application.initialInterviewResult?.toUpperCase() || "N/A"}
                  </span>
                </div>
              </div>
              {application.initialInterviewFeedback && (
                <div className="md:col-span-2">
                  <p className="text-sm text-blue-700">Feedback</p>
                  <p className="text-sm text-blue-800 bg-white rounded p-2 break-words">
                    {application.initialInterviewFeedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final Interview Schedule */}
        {application.finalInterviewSchedule && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Final Interview Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-blue-700">Date & Time</p>
                <p className="font-medium text-blue-900">
                  {formatDate(application.finalInterviewSchedule)}
                  {application.finalInterviewTime &&
                    ` at ${application.finalInterviewTime}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Final Interview Assessment */}
        {(application.finalInterviewResult ||
          application.finalInterviewFeedback) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Final Interview Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-green-700">Result</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                      application.finalInterviewResult,
                    )}`}
                  >
                    {application.finalInterviewResult?.toUpperCase() || "N/A"}
                  </span>
                </div>
              </div>
              {application.finalInterviewFeedback && (
                <div className="md:col-span-2">
                  <p className="text-sm text-blue-700">Feedback</p>
                  <p className="text-sm text-blue-800 bg-white rounded p-2 break-words">
                    {application.finalInterviewFeedback}
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
