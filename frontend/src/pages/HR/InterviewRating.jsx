import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { formatDate } from "../../utils/formatDate";
import { useApplicationStore } from "../../store/applicationStore";
import { applicationApi } from "../../api/applicationApi";

const InterviewRating = () => {
  const navigate = useNavigate();
  const {
    applications,
    getAllApplications,
    getApplicationById,
    loading: appLoading,
    error: appError,
  } = useApplicationStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [interviewScore, setInterviewScore] = useState("");
  const [interviewResult, setInterviewResult] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const passingScore = 75; // Minimum passing score

  useEffect(() => {
    // Fetch only applications with interview schedules
    getAllApplications({ interviewEligible: true });
  }, [getAllApplications]);

  // Auto-calculate result when interviewScore changes
  useEffect(() => {
    if (interviewScore !== "") {
      const score = parseFloat(interviewScore);
      if (!isNaN(score)) {
        setInterviewResult(score >= passingScore ? "PASS" : "FAIL");
      }
    }
  }, [interviewScore]);

  useEffect(() => {
    const applicationId = searchParams.get("applicationId");
    if (!applicationId) return;

    const app = applications?.find(
      (a) => String(a.id) === String(applicationId)
    );
    if (app) {
      setSelectedApplication(app);
      setShowModal(true);
      setSearchParams({});
    } else {
      (async () => {
        try {
          const res = await getApplicationById(applicationId);
          const appFromApi = res?.application;
          if (appFromApi) {
            setSelectedApplication(appFromApi);
            setShowModal(true);
            setSearchParams({});
          }
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [applications, searchParams, getApplicationById, setSearchParams]);

  const openRatingModal = (app) => {
    setSelectedApplication(app);
    setShowModal(true);

    // Initialize with existing data if available
    if (app.interviewScore !== null && app.interviewScore !== undefined) {
      setInterviewScore(app.interviewScore.toString());
      setInterviewResult(app.interviewResult || "");
      setInterviewNotes(app.interviewNotes || "");
    } else {
      setInterviewScore("");
      setInterviewResult("");
      setInterviewNotes("");
    }
    setError(null);
  };

  const handleSubmitRating = async () => {
    if (!selectedApplication || interviewScore === "") {
      setError("Please enter an interview score");
      return;
    }

    const score = parseFloat(interviewScore);
    if (isNaN(score) || score < 0 || score > 100) {
      setError("Interview score must be between 0 and 100");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await applicationApi.rateInterview(
        selectedApplication.id,
        score,
        interviewResult,
        interviewNotes
      );

      setShowModal(false);
      setSelectedApplication(null);
      setInterviewScore("");
      setInterviewResult("");
      setInterviewNotes("");

      // Refresh applications
      getAllApplications({ interviewEligible: true });
    } catch (error) {
      console.error("Failed to submit interview rating:", error);
      setError(error.message || "Failed to submit interview rating");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Applicant",
      accessor: (row) =>
        `${row.applicant?.firstName} ${row.applicant?.lastName}`,
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.applicant?.firstName} {row.applicant?.lastName}
          </p>
          <p className="text-sm text-gray-500">{row.applicant?.email}</p>
        </div>
      ),
    },
    {
      header: "Interview Schedule",
      accessor: "interviewSchedule",
      cell: (row) => (
        <div className="text-sm">
          {row.interviewSchedule ? (
            <div>
              <p className="font-medium text-green-600">Scheduled</p>
              <p className="text-gray-600">
                {formatDate(row.interviewSchedule)}
              </p>
              {row.interviewTime && (
                <p className="text-gray-600 font-medium">{row.interviewTime}</p>
              )}
            </div>
          ) : (
            <span className="text-yellow-600 font-medium">Pending</span>
          )}
        </div>
      ),
    },
    {
      header: "Rating Status",
      accessor: "interviewScore",
      cell: (row) => (
        <div className="text-sm">
          {row.interviewScore !== null && row.interviewScore !== undefined ? (
            <div>
              <p className="font-medium text-green-600">Rated</p>
              <p className="text-gray-600">Score: {row.interviewScore}</p>
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                  row.interviewResult?.toLowerCase() === "pass"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {row.interviewResult?.toUpperCase()}
              </span>
            </div>
          ) : (
            <span className="text-yellow-600 font-medium">Pending</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            onClick={() => openRatingModal(row)}
            disabled={!row.interviewSchedule}
            size="sm"
            variant={
              row.interviewScore !== null && row.interviewScore !== undefined
                ? "outline"
                : "primary"
            }
          >
            {row.interviewScore !== null && row.interviewScore !== undefined
              ? "Edit Rating"
              : "Rate Interview"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Interview Rating
        </h1>
        <p className="text-gray-600">Record ratings/feedback for interviews.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <DashboardCard title="Interviews">
        <div className="mt-4">
          <div className="hidden lg:block">
            <Table
              columns={columns}
              data={(applications || []).filter((app) => app.interviewSchedule)}
            />
          </div>

          <div className="lg:hidden space-y-4">
            {(applications || [])
              .filter((app) => app.interviewSchedule)
              .map((app, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 break-words">
                        {app.applicant?.firstName} {app.applicant?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 break-all">
                        {app.applicant?.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Interview Schedule:</span>
                      {app.interviewSchedule ? (
                        <div className="mt-1">
                          <p className="font-medium text-green-600">
                            Scheduled
                          </p>
                          <p className="text-gray-600">
                            {formatDate(app.interviewSchedule)}
                          </p>
                          {app.interviewTime && (
                            <p className="text-gray-600 font-medium">
                              {app.interviewTime}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-yellow-600 font-medium">Pending</p>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Rating Status:</span>
                      {app.interviewScore !== null &&
                      app.interviewScore !== undefined ? (
                        <div className="mt-1">
                          <p className="font-medium text-green-600">Rated</p>
                          <p className="text-gray-600">
                            Score: {app.interviewScore}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                              app.interviewResult?.toLowerCase() === "pass"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {app.interviewResult?.toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <p className="text-yellow-600 font-medium">Pending</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => openRatingModal(app)}
                      size="sm"
                      className="flex-1"
                      disabled={!app.interviewSchedule}
                      variant={
                        app.interviewScore !== null &&
                        app.interviewScore !== undefined
                          ? "outline"
                          : "primary"
                      }
                    >
                      {app.interviewScore !== null &&
                      app.interviewScore !== undefined
                        ? "Edit Rating"
                        : "Rate Interview"}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DashboardCard>

      {showModal && selectedApplication && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedApplication(null);
            setError(null);
          }}
          title={`Rate Interview - ${selectedApplication.applicant?.firstName} ${selectedApplication.applicant?.lastName}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Interview Info */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                INTERVIEW DETAILS
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Interview Date:</span>
                  <span className="ml-2 break-words">
                    {selectedApplication.interviewSchedule
                      ? formatDate(selectedApplication.interviewSchedule)
                      : "Not scheduled"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>
                  <span className="ml-2">
                    {selectedApplication.interviewTime || "Not set"}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Interview Score Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Score (0-100)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={interviewScore}
                onChange={(e) => setInterviewScore(e.target.value)}
                placeholder="Enter interview score (e.g., 85.5)"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Minimum passing score: {passingScore}
              </p>
            </div>

            {/* Result Display */}
            {interviewResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <h4 className="font-medium text-blue-900">Result</h4>
                    <p className="text-sm text-blue-700">
                      Based on the score entered
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <span
                      className={`inline-block px-4 py-2 text-lg font-medium rounded-full ${
                        interviewResult === "PASS"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {interviewResult}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback and Comments
              </label>
              <textarea
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                rows="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed feedback about the interview performance, strengths, areas for improvement, etc..."
              />
            </div>

            {/* Current Rating Info */}
            {selectedApplication.interviewScore !== null &&
              selectedApplication.interviewScore !== undefined && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 sm:p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">
                    ⚠️ Editing Existing Rating
                  </h4>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p>
                      Current Interview Score:{" "}
                      <strong>{selectedApplication.interviewScore}</strong>
                    </p>
                    <p>
                      Current Result:{" "}
                      <strong>
                        {selectedApplication.interviewResult?.toUpperCase()}
                      </strong>
                    </p>
                    <p className="text-xs mt-2">
                      Submitting will overwrite the current rating and result.
                    </p>
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
              <Button
                onClick={() => {
                  setShowModal(false);
                  setSelectedApplication(null);
                  setError(null);
                }}
                variant="outline"
                className="w-full sm:w-auto"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRating}
                variant="primary"
                disabled={!interviewScore || loading}
                className="w-full sm:w-auto"
              >
                {loading
                  ? "Saving..."
                  : selectedApplication.interviewScore !== null &&
                    selectedApplication.interviewScore !== undefined
                  ? "Update Rating"
                  : "Submit Rating"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InterviewRating;
