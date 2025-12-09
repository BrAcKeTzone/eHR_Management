import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../store/applicationStore";
import { applicationApi } from "../../api/applicationApi";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { formatDate } from "../../utils/formatDate";

const Scoring = () => {
  const {
    applications,
    getAllApplications,
    loading: appLoading,
    error: appError,
  } = useApplicationStore();
  const navigate = useNavigate();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [totalScore, setTotalScore] = useState("");
  const [result, setResult] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const passingScore = 75; // Minimum passing score

  useEffect(() => {
    // Load applications with scheduled demos
    getAllApplications({ status: "APPROVED" });
  }, [getAllApplications]);

  // Auto-calculate result when totalScore changes
  useEffect(() => {
    if (totalScore !== "") {
      const score = parseFloat(totalScore);
      if (!isNaN(score)) {
        setResult(score >= passingScore ? "PASS" : "FAIL");
      }
    }
  }, [totalScore]);

  const scheduledApplications =
    applications?.filter(
      (app) => app.status === "APPROVED" && app.demoSchedule
    ) || [];

  const handleScoreApplication = (application) => {
    setSelectedApplication(application);
    setShowScoringModal(true);

    // Initialize with existing data if available
    if (
      application.totalScore !== null &&
      application.totalScore !== undefined
    ) {
      setTotalScore(application.totalScore.toString());
      setResult(application.result || "");
      setFeedback(application.hrNotes || "");
    } else {
      setTotalScore("");
      setResult("");
      setFeedback("");
    }
    setError(null);
  };

  const handleSubmitScores = async () => {
    if (!selectedApplication || totalScore === "") {
      setError("Please enter a total score");
      return;
    }

    const score = parseFloat(totalScore);
    if (isNaN(score) || score < 0 || score > 100) {
      setError("Total score must be between 0 and 100");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await applicationApi.completeApplication(
        selectedApplication.id,
        score,
        result,
        feedback
      );

      setShowScoringModal(false);
      setSelectedApplication(null);
      setTotalScore("");
      setResult("");
      setFeedback("");

      // Refresh general HR list
      getAllApplications({ status: "APPROVED" });
      // If this entry passed (PASS), also refresh the Interview Scheduling list
      const updatedResult = res?.application?.result || result;
      if ((updatedResult || "").toUpperCase() === "PASS") {
        // Refresh interview-eligible list
        getAllApplications({ interviewEligible: true });
        // Navigate to interview scheduling for the newly updated application
        const appId = res?.application?.id || selectedApplication.id;
        navigate(`/hr/interview-scheduling?applicationId=${appId}`);
      }
    } catch (error) {
      console.error("Failed to submit scores:", error);
      setError(error.message || "Failed to submit scores");
    } finally {
      setLoading(false);
    }
  };

  const applicationsColumns = [
    {
      header: "Applicant",
      accessor: "applicant.name",
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
      header: "Demo Schedule",
      accessor: "demoSchedule",
      cell: (row) => (
        <div className="text-sm">
          {row.demoSchedule ? (
            <div>
              <p>{formatDate(row.demoSchedule)}</p>
              <p className="text-gray-600">{row.demoTime || "Time not set"}</p>
              <p className="text-gray-500 text-xs">
                {row.demoLocation || "Location TBA"}
              </p>
            </div>
          ) : (
            <span className="text-yellow-600">Not scheduled</span>
          )}
        </div>
      ),
    },
    {
      header: "Score Status",
      accessor: "totalScore",
      cell: (row) => (
        <div className="text-sm">
          {row.totalScore !== null && row.totalScore !== undefined ? (
            <div>
              <p className="font-medium text-green-600">Scored</p>
              <p className="text-gray-600">Total: {row.totalScore}</p>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  row.result?.toLowerCase() === "pass"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {row.result?.toUpperCase()}
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
            onClick={() => handleScoreApplication(row)}
            variant={
              row.totalScore !== null && row.totalScore !== undefined
                ? "outline"
                : "primary"
            }
            size="sm"
            disabled={!row.demoSchedule}
          >
            {row.totalScore !== null && row.totalScore !== undefined
              ? "Edit Scores"
              : "Score Demo"}
          </Button>
        </div>
      ),
    },
  ];

  if (appLoading && !applications) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Demo Scoring
        </h1>
        <p className="text-gray-600">
          Score teaching demonstrations and provide feedback.
        </p>
      </div>

      {/* Error Display */}
      {appError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {appError}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <DashboardCard title="Total Scheduled" className="text-center">
          <div className="text-xl sm:text-3xl font-bold text-blue-600">
            {scheduledApplications.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Demos</div>
        </DashboardCard>

        <DashboardCard title="Scored" className="text-center">
          <div className="text-xl sm:text-3xl font-bold text-green-600">
            {
              scheduledApplications.filter(
                (app) => app.totalScore !== null && app.totalScore !== undefined
              ).length
            }
          </div>
          <div className="text-sm text-gray-500 mt-1">Completed</div>
        </DashboardCard>

        <DashboardCard title="Pending" className="text-center">
          <div className="text-xl sm:text-3xl font-bold text-yellow-600">
            {
              scheduledApplications.filter(
                (app) => app.totalScore === null || app.totalScore === undefined
              ).length
            }
          </div>
          <div className="text-sm text-gray-500 mt-1">Need scoring</div>
        </DashboardCard>

        <DashboardCard title="Pass Rate" className="text-center">
          <div className="text-xl sm:text-3xl font-bold text-purple-600">
            {scheduledApplications.filter(
              (app) => app.result?.toLowerCase() === "pass"
            ).length > 0
              ? Math.round(
                  (scheduledApplications.filter(
                    (app) => app.result?.toLowerCase() === "pass"
                  ).length /
                    scheduledApplications.filter(
                      (app) =>
                        app.totalScore !== null && app.totalScore !== undefined
                    ).length) *
                    100
                )
              : 0}
            %
          </div>
          <div className="text-sm text-gray-500 mt-1">Success rate</div>
        </DashboardCard>
      </div>

      {/* Applications Table */}
      <DashboardCard title="Scheduled Demos">
        {scheduledApplications.length > 0 ? (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table
                columns={applicationsColumns}
                data={scheduledApplications}
              />
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {scheduledApplications.map((app, index) => (
                <div
                  key={app.id || index}
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
                      <span className="text-gray-500">Demo Date:</span>
                      <p className="font-medium">
                        {app.demoSchedule
                          ? `${formatDate(app.demoSchedule)} at ${
                              app.demoTime || "Time not set"
                            }`
                          : "Not scheduled"}
                      </p>
                      {app.demoLocation && (
                        <p className="text-gray-500 text-xs break-words">
                          Location: {app.demoLocation}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Score Status:</span>
                      {app.totalScore !== null &&
                      app.totalScore !== undefined ? (
                        <div className="mt-1">
                          <p className="font-medium text-green-600">Scored</p>
                          <p className="text-gray-600">
                            Total: {app.totalScore}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                              app.result?.toLowerCase() === "pass"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {app.result?.toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <p className="text-yellow-600 font-medium">Pending</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleScoreApplication(app)}
                      variant={
                        app.totalScore !== null && app.totalScore !== undefined
                          ? "outline"
                          : "primary"
                      }
                      size="sm"
                      disabled={!app.demoSchedule}
                      className="flex-1"
                    >
                      {app.totalScore !== null && app.totalScore !== undefined
                        ? "Edit Scores"
                        : "Score Demo"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No scheduled demos found.</p>
          </div>
        )}
      </DashboardCard>

      {/* Scoring Modal */}
      {showScoringModal && selectedApplication && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowScoringModal(false);
            setError(null);
          }}
          title={`Score Demo - ${selectedApplication.applicant?.firstName} ${selectedApplication.applicant?.lastName}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Application Info */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                DEMONSTRATION DETAILS
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Demo Date:</span>
                  <span className="ml-2 break-words">
                    {selectedApplication.demoSchedule
                      ? formatDate(selectedApplication.demoSchedule)
                      : "Not scheduled"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>
                  <span className="ml-2">
                    {selectedApplication.demoTime || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2 break-words">
                    {selectedApplication.demoLocation || "Not specified"}
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

            {/* Total Score Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Score (0-100)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={totalScore}
                onChange={(e) => setTotalScore(e.target.value)}
                placeholder="Enter total score (e.g., 85.5)"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Minimum passing score: {passingScore}
              </p>
            </div>

            {/* Result Display */}
            {result && (
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
                        result === "PASS"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result}
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
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed feedback about the demonstration performance, strengths, areas for improvement, etc..."
              />
            </div>

            {/* Current Scores Info */}
            {selectedApplication.totalScore !== null &&
              selectedApplication.totalScore !== undefined && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 sm:p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">
                    ⚠️ Editing Existing Score
                  </h4>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p>
                      Current Total Score:{" "}
                      <strong>{selectedApplication.totalScore}</strong>
                    </p>
                    <p>
                      Current Result:{" "}
                      <strong>
                        {selectedApplication.result?.toUpperCase()}
                      </strong>
                    </p>
                    <p className="text-xs mt-2">
                      Submitting will overwrite the current score and result.
                    </p>
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
              <Button
                onClick={() => {
                  setShowScoringModal(false);
                  setError(null);
                }}
                variant="outline"
                className="w-full sm:w-auto"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitScores}
                variant="primary"
                disabled={!totalScore || loading}
                className="w-full sm:w-auto"
              >
                {loading
                  ? "Saving..."
                  : selectedApplication.totalScore !== null &&
                    selectedApplication.totalScore !== undefined
                  ? "Update Score"
                  : "Submit Score"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Scoring;
