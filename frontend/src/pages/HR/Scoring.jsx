import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import { useScoringStore } from "../../store/scoringStore";
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

  const {
    submitScores,
    updateScores,
    getRubricCriteria,
    rubricCriteria,
    loading: scoreLoading,
    error: scoreError,
  } = useScoringStore();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [scores, setScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [result, setResult] = useState("");
  const [feedback, setFeedback] = useState("");

  const passingScore = 75; // Minimum passing score

  useEffect(() => {
    // Load applications with scheduled demos
    getAllApplications({ status: "approved" });
    getRubricCriteria();
  }, [getAllApplications, getRubricCriteria]);

  useEffect(() => {
    // Calculate total score when individual scores change
    if (rubricCriteria && Object.keys(scores).length > 0) {
      let total = 0;
      let totalWeight = 0;

      rubricCriteria.forEach((criteria) => {
        const score = scores[criteria.id] || 0;
        const weight = criteria.weight || 1;
        total += score * weight;
        totalWeight += weight;
      });

      const calculatedTotal = totalWeight > 0 ? total / totalWeight : 0;
      setTotalScore(Math.round(calculatedTotal * 100) / 100);
      setResult(calculatedTotal >= passingScore ? "pass" : "fail");
    }
  }, [scores, rubricCriteria]);

  const scheduledApplications =
    applications?.filter(
      (app) => app.status === "approved" && app.demo_schedule
    ) || [];

  const handleScoreApplication = (application) => {
    setSelectedApplication(application);
    setShowScoringModal(true);

    // Initialize scores
    if (application.scores) {
      const initialScores = {};
      application.scores.forEach((score) => {
        initialScores[score.criteria_id] = score.score;
      });
      setScores(initialScores);
      setFeedback(application.feedback || "");
    } else {
      setScores({});
      setFeedback("");
    }
  };

  const handleScoreChange = (criteriaId, value) => {
    const numericValue = Math.max(0, Math.min(100, parseFloat(value) || 0));
    setScores((prev) => ({
      ...prev,
      [criteriaId]: numericValue,
    }));
  };

  const handleSubmitScores = async () => {
    if (!selectedApplication || Object.keys(scores).length === 0) return;

    try {
      const scoreData = {
        scores: Object.entries(scores).map(([criteriaId, score]) => ({
          criteria_id: criteriaId,
          score: score,
        })),
        total_score: totalScore,
        result: result,
        feedback: feedback,
      };

      if (selectedApplication.scores && selectedApplication.scores.length > 0) {
        await updateScores(selectedApplication.id, scoreData);
      } else {
        await submitScores(selectedApplication.id, scoreData);
      }

      setShowScoringModal(false);
      setSelectedApplication(null);
      // Refresh applications
      getAllApplications({ status: "approved" });
    } catch (error) {
      console.error("Failed to submit scores:", error);
    }
  };

  const applicationsColumns = [
    {
      header: "Applicant",
      accessor: "applicant_name",
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.applicant_name}</p>
          <p className="text-sm text-gray-500">{row.applicant_email}</p>
        </div>
      ),
    },
    {
      header: "Program",
      accessor: "program",
      cell: (row) => (
        <div className="text-sm">
          <p className="font-medium">{row.program}</p>
        </div>
      ),
    },
    {
      header: "Demo Schedule",
      accessor: "demo_schedule",
      cell: (row) => (
        <div className="text-sm">
          {row.demo_schedule ? (
            <div>
              <p>{formatDate(row.demo_schedule.date)}</p>
              <p className="text-gray-600">{row.demo_schedule.time}</p>
              <p className="text-gray-500 text-xs">
                {row.demo_schedule.location || "Location TBA"}
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
      accessor: "scores",
      cell: (row) => (
        <div className="text-sm">
          {row.scores && row.scores.length > 0 ? (
            <div>
              <p className="font-medium text-green-600">Scored</p>
              <p className="text-gray-600">Total: {row.total_score}%</p>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  row.result === "pass"
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
              row.scores && row.scores.length > 0 ? "outline" : "primary"
            }
            size="sm"
            disabled={!row.demo_schedule}
          >
            {row.scores && row.scores.length > 0 ? "Edit Scores" : "Score Demo"}
          </Button>
        </div>
      ),
    },
  ];

  const loading = appLoading || scoreLoading;
  const error = appError || scoreError;

  if (loading && !applications) {
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
          Score teaching demonstrations using the evaluation rubric.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
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
                (app) => app.scores && app.scores.length > 0
              ).length
            }
          </div>
          <div className="text-sm text-gray-500 mt-1">Completed</div>
        </DashboardCard>

        <DashboardCard title="Pending" className="text-center">
          <div className="text-xl sm:text-3xl font-bold text-yellow-600">
            {
              scheduledApplications.filter(
                (app) => !app.scores || app.scores.length === 0
              ).length
            }
          </div>
          <div className="text-sm text-gray-500 mt-1">Need scoring</div>
        </DashboardCard>

        <DashboardCard title="Pass Rate" className="text-center">
          <div className="text-xl sm:text-3xl font-bold text-purple-600">
            {scheduledApplications.filter((app) => app.result === "pass")
              .length > 0
              ? Math.round(
                  (scheduledApplications.filter((app) => app.result === "pass")
                    .length /
                    scheduledApplications.filter(
                      (app) => app.scores && app.scores.length > 0
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
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 break-words">
                        {app.applicant_name}
                      </h3>
                      <p className="text-sm text-gray-500 break-all">
                        {app.applicant_email}
                      </p>
                      <p className="text-sm font-medium break-words">
                        {app.program}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Demo Date:</span>
                      <p className="font-medium">
                        {app.demo_schedule
                          ? `${formatDate(app.demo_schedule.date)} at ${
                              app.demo_schedule.time
                            }`
                          : "Not scheduled"}
                      </p>
                      {app.demo_schedule?.location && (
                        <p className="text-gray-500 text-xs break-words">
                          Location: {app.demo_schedule.location}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Score Status:</span>
                      {app.scores && app.scores.length > 0 ? (
                        <div className="mt-1">
                          <p className="font-medium text-green-600">Scored</p>
                          <p className="text-gray-600">
                            Total: {app.total_score}%
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                              app.result === "pass"
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
                        app.scores && app.scores.length > 0
                          ? "outline"
                          : "primary"
                      }
                      size="sm"
                      disabled={!app.demo_schedule}
                      className="flex-1"
                    >
                      {app.scores && app.scores.length > 0
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
          onClose={() => setShowScoringModal(false)}
          title={`Score Demo - ${selectedApplication.applicant_name}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Application Info */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Demo Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Program:</span>
                  <span className="ml-2 font-medium break-words">
                    {selectedApplication.program}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Demo Date:</span>
                  <span className="ml-2 break-words">
                    {formatDate(selectedApplication.demo_schedule?.date)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>
                  <span className="ml-2">
                    {selectedApplication.demo_schedule?.time}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2 break-words">
                    {selectedApplication.demo_schedule?.location ||
                      "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Scoring Rubric */}
            {rubricCriteria && rubricCriteria.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 sm:mb-4">
                  Evaluation Criteria
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  {rubricCriteria.map((criteria) => (
                    <div
                      key={criteria.id}
                      className="border border-gray-200 rounded-md p-3 sm:p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 break-words">
                            {criteria.name}
                          </h5>
                          {criteria.description && (
                            <p className="text-sm text-gray-600 mt-1 break-words">
                              {criteria.description}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex-shrink-0">
                          Weight: {criteria.weight || 1}x
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={scores[criteria.id] || ""}
                            onChange={(e) =>
                              handleScoreChange(criteria.id, e.target.value)
                            }
                            placeholder="Score (0-100)"
                            className="w-full"
                          />
                        </div>
                        <div className="text-sm text-gray-600 text-center sm:text-left">
                          / 100 points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Score Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h4 className="font-medium text-blue-900">Total Score</h4>
                  <p className="text-sm text-blue-700">
                    Minimum passing score: {passingScore}%
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {totalScore}%
                  </div>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-1 ${
                      result === "pass"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {result?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback and Comments
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed feedback about the demonstration performance..."
              />
            </div>

            {/* Current Scores Info */}
            {selectedApplication.scores &&
              selectedApplication.scores.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 sm:p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">
                    Current Scores
                  </h4>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p>Total Score: {selectedApplication.total_score}%</p>
                    <p>Result: {selectedApplication.result?.toUpperCase()}</p>
                    <p className="text-xs">You are editing existing scores.</p>
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowScoringModal(false)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitScores}
                variant="primary"
                disabled={Object.keys(scores).length === 0 || scoreLoading}
                className="w-full sm:w-auto"
              >
                {scoreLoading
                  ? "Saving..."
                  : selectedApplication.scores &&
                    selectedApplication.scores.length > 0
                  ? "Update Scores"
                  : "Submit Scores"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Scoring;
