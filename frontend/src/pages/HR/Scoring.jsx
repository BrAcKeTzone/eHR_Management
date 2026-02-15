import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../store/applicationStore";
import { applicationApi } from "../../api/applicationApi";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import ApplicationDetailsModal from "../../components/ApplicationDetailsModal";
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
  const [studentLearningScore, setStudentLearningScore] = useState("");
  const [knowledgeScore, setKnowledgeScore] = useState("");
  const [teachingMethodScore, setTeachingMethodScore] = useState("");
  const [attributesScore, setAttributesScore] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [result, setResult] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const passingScore = 75; // Minimum passing score
  const maxScores = {
    studentLearning: 30,
    knowledge: 30,
    teachingMethod: 30,
    attributes: 10,
  };
  const hasAllScores = [
    studentLearningScore,
    knowledgeScore,
    teachingMethodScore,
    attributesScore,
  ].every((v) => v !== "");

  useEffect(() => {
    // Load applications with scheduled demos
    getAllApplications({ status: "APPROVED" });
  }, [getAllApplications]);

  // Auto-calculate total and result when category scores change
  useEffect(() => {
    const toNumber = (val) => {
      const num = parseFloat(val);
      return Number.isFinite(num) ? num : 0;
    };

    const s = toNumber(studentLearningScore);
    const k = toNumber(knowledgeScore);
    const t = toNumber(teachingMethodScore);
    const a = toNumber(attributesScore);
    const sum = s + k + t + a;
    setTotalScore(sum);

    // Only set result when all fields have values
    const allProvided = [
      studentLearningScore,
      knowledgeScore,
      teachingMethodScore,
      attributesScore,
    ].every((v) => v !== "");

    if (allProvided) {
      setResult(sum >= passingScore ? "PASS" : "FAIL");
    } else {
      setResult("");
    }
  }, [
    studentLearningScore,
    knowledgeScore,
    teachingMethodScore,
    attributesScore,
  ]);

  // Only include applications that are approved, have a demo scheduled,
  // and have NOT been scored yet (totalScore null/undefined)
  const scheduledApplications =
    applications?.filter(
      (app) =>
        app.status === "APPROVED" &&
        app.demoSchedule &&
        (app.totalScore === null || app.totalScore === undefined),
    ) || [];

  const handleScoreApplication = (application) => {
    setSelectedApplication(application);
    setShowScoringModal(true);

    // Initialize with existing data if available
    if (
      application.totalScore !== null &&
      application.totalScore !== undefined
    ) {
      setStudentLearningScore(
        application.studentLearningActionsScore?.toString() ?? "",
      );
      setKnowledgeScore(application.knowledgeOfSubjectScore?.toString() ?? "");
      setTeachingMethodScore(application.teachingMethodScore?.toString() ?? "");
      setAttributesScore(
        application.instructorAttributesScore?.toString() ?? "",
      );
      setResult(application.result || "");
      setTotalScore(application.totalScore || 0);
      setFeedback(application.hrNotes || "");
    } else {
      setStudentLearningScore("");
      setKnowledgeScore("");
      setTeachingMethodScore("");
      setAttributesScore("");
      setResult("");
      setTotalScore(0);
      setFeedback("");
    }
    setError(null);
  };

  // Optional: show application details in a modal (reuse the details modal)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setShowDetailsModal(true);
  };

  const handleSubmitScores = async () => {
    const parsed = (val) => {
      const num = parseFloat(val);
      return Number.isFinite(num) ? num : NaN;
    };

    const scores = {
      studentLearningActionsScore: parsed(studentLearningScore),
      knowledgeOfSubjectScore: parsed(knowledgeScore),
      teachingMethodScore: parsed(teachingMethodScore),
      instructorAttributesScore: parsed(attributesScore),
    };

    if (!selectedApplication) {
      setError("No application selected");
      return;
    }

    const missing = Object.values(scores).some((v) => isNaN(v));
    if (missing) {
      setError("Please enter all category scores");
      return;
    }

    const validators = [
      {
        value: scores.studentLearningActionsScore,
        max: maxScores.studentLearning,
      },
      { value: scores.knowledgeOfSubjectScore, max: maxScores.knowledge },
      { value: scores.teachingMethodScore, max: maxScores.teachingMethod },
      { value: scores.instructorAttributesScore, max: maxScores.attributes },
    ];

    const invalid = validators.find(
      ({ value, max }) => value < 0 || value > max,
    );
    if (invalid) {
      setError("Scores must be within their allowed ranges");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await applicationApi.completeApplication(
        selectedApplication.id,
        scores,
        feedback,
      );

      setShowScoringModal(false);
      setSelectedApplication(null);
      setStudentLearningScore("");
      setKnowledgeScore("");
      setTeachingMethodScore("");
      setAttributesScore("");
      setTotalScore(0);
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
          Score scheduled demos awaiting scoring (only unscored scheduled demos
          are listed).
        </p>
      </div>

      {/* Error Display */}
      {appError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {appError}
        </div>
      )}

      {/* Removed statistics block - show only scheduled demos that need scoring */}

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
                    <Button
                      onClick={() => handleViewDetails(app)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No scheduled demos awaiting scoring.
            </p>
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

            {/* Category Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={`Student Learning Actions (0-${maxScores.studentLearning})`}
                type="number"
                min="0"
                max={maxScores.studentLearning}
                step="0.01"
                value={studentLearningScore}
                onChange={(e) => setStudentLearningScore(e.target.value)}
                required
              />
              <Input
                label={`Knowledge of the Subject Matter (0-${maxScores.knowledge})`}
                type="number"
                min="0"
                max={maxScores.knowledge}
                step="0.01"
                value={knowledgeScore}
                onChange={(e) => setKnowledgeScore(e.target.value)}
                required
              />
              <Input
                label={`Teaching Method (0-${maxScores.teachingMethod})`}
                type="number"
                min="0"
                max={maxScores.teachingMethod}
                step="0.01"
                value={teachingMethodScore}
                onChange={(e) => setTeachingMethodScore(e.target.value)}
                required
              />
              <Input
                label={`Instructor's Personal & Professional Attributes (0-${maxScores.attributes})`}
                type="number"
                min="0"
                max={maxScores.attributes}
                step="0.01"
                value={attributesScore}
                onChange={(e) => setAttributesScore(e.target.value)}
                required
              />
            </div>

            {/* Totals */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h4 className="font-medium text-blue-900">Overall Total</h4>
                  <p className="text-sm text-blue-700">
                    Sum of all categories (max 100)
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <span className="inline-block px-4 py-2 text-lg font-medium rounded-full bg-white text-blue-900 border border-blue-200">
                    {totalScore.toFixed(2)} / 100
                  </span>
                </div>
              </div>
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
                disabled={!hasAllScores || loading}
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

      {/* Application Details Modal (reusable) */}
      {showDetailsModal && selectedApplication && (
        <ApplicationDetailsModal
          isOpen={showDetailsModal}
          application={selectedApplication}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default Scoring;
