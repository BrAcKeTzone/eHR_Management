import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import { applicationApi } from "../../api/applicationApi";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import { formatDate } from "../../utils/formatDate";
import { APPLICATION_STATUS } from "../../utils/constants";

const ApplicationReview = () => {
  const {
    applications,
    getAllApplications,
    updateApplicationStatus,
    loading,
    error,
  } = useApplicationStore();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState("");
  const [reason, setReason] = useState("");
  const [downloadingDoc, setDownloadingDoc] = useState(null); // Track which doc is downloading
  const [filters, setFilters] = useState({
    status: APPLICATION_STATUS.PENDING,
    program: "",
    search: "",
  });

  useEffect(() => {
    getAllApplications(filters);
  }, [getAllApplications, filters]);

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

  const handleDecision = async () => {
    if (!selectedApplication || !decision) return;

    try {
      await updateApplicationStatus(selectedApplication.id, decision, reason);
      setShowDecisionModal(false);
      setSelectedApplication(null);
      setDecision("");
      setReason("");
      // Refresh applications
      getAllApplications(filters);
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  };

  const openDecisionModal = (application, decisionType) => {
    setSelectedApplication(application);
    // Convert to uppercase for backend
    setDecision(decisionType.toUpperCase());
    setShowDecisionModal(true);
  };

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

  const filteredApplications =
    applications?.filter((app) => {
      return (
        (!filters.status || app.status === filters.status) &&
        (!filters.program ||
          app.program.toLowerCase().includes(filters.program.toLowerCase())) &&
        (!filters.search ||
          app.applicant?.name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          app.applicant?.email
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()))
      );
    }) || [];

  const applicationsColumns = [
    {
      header: "Applicant",
      accessor: "applicant.name",
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.applicant?.name}</p>
          <p className="text-sm text-gray-500">{row.applicant?.email}</p>
          <p className="text-xs text-gray-400">Attempt #{row.attemptNumber}</p>
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
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            row.status
          )}`}
        >
          {row.status?.toUpperCase()}
        </span>
      ),
    },
    {
      header: "Submitted",
      accessor: "createdAt",
      cell: (row) => (
        <div className="text-sm text-gray-600">{formatDate(row.createdAt)}</div>
      ),
    },
    {
      header: "Documents",
      accessor: "documents",
      cell: (row) => {
        let documentCount = 0;
        try {
          const docs = row.documents ? JSON.parse(row.documents) : [];
          documentCount = Array.isArray(docs) ? docs.length : 0;
        } catch (e) {
          documentCount = 0;
        }
        return <div className="text-sm">{documentCount} files</div>;
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            onClick={() => setSelectedApplication(row)}
            variant="outline"
            size="sm"
          >
            View
          </Button>
          {row.status === APPLICATION_STATUS.PENDING && (
            <>
              <Button
                onClick={() => openDecisionModal(row, "approved")}
                variant="primary"
                size="sm"
              >
                Approve
              </Button>
              <Button
                onClick={() => openDecisionModal(row, "rejected")}
                variant="danger"
                size="sm"
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
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
          Application Review
        </h1>
        <p className="text-gray-600">
          Review and process teaching applications from candidates.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filters */}
      <DashboardCard title="Filter Applications" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value={APPLICATION_STATUS.PENDING}>Pending</option>
              <option value={APPLICATION_STATUS.APPROVED}>Approved</option>
              <option value={APPLICATION_STATUS.REJECTED}>Rejected</option>
              <option value={APPLICATION_STATUS.COMPLETED}>Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program
            </label>
            <input
              type="text"
              value={filters.program}
              onChange={(e) =>
                setFilters({ ...filters, program: e.target.value })
              }
              placeholder="Filter by program"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="Search by name or email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={() =>
                setFilters({ status: "", program: "", search: "" })
              }
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </DashboardCard>

      {/* Applications Table */}
      <DashboardCard title={`Applications (${filteredApplications.length})`}>
        {filteredApplications.length > 0 ? (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table
                columns={applicationsColumns}
                data={filteredApplications}
              />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredApplications.map((app, index) => (
                <div
                  key={app.id || index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {app.applicant?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {app.applicant?.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Attempt #{app.attemptNumber}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-xs text-gray-500">Program:</span>
                      <p className="text-sm font-medium">{app.program}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Submitted:</span>
                      <p className="text-sm">{formatDate(app.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Documents:</span>
                      <p className="text-sm">
                        {(() => {
                          try {
                            const docs = app.documents
                              ? JSON.parse(app.documents)
                              : [];
                            return Array.isArray(docs) ? docs.length : 0;
                          } catch (e) {
                            return 0;
                          }
                        })()}{" "}
                        files
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setSelectedApplication(app)}
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-0"
                    >
                      View
                    </Button>
                    {app.status === APPLICATION_STATUS.PENDING && (
                      <>
                        <Button
                          onClick={() => openDecisionModal(app, "approved")}
                          variant="primary"
                          size="sm"
                          className="flex-1 min-w-0"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => openDecisionModal(app, "rejected")}
                          variant="danger"
                          size="sm"
                          className="flex-1 min-w-0"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No applications found matching your criteria.
            </p>
          </div>
        )}
      </DashboardCard>

      {/* Application Detail Modal */}
      {selectedApplication && !showDecisionModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApplication(null)}
          title={`Application Details - ${selectedApplication.applicant?.name}`}
          size="large"
        >
          <div className="space-y-6 max-h-96 sm:max-h-none overflow-y-auto">
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
                      selectedApplication.status
                    )}`}
                  >
                    {selectedApplication.status?.toUpperCase()}
                  </span>
                </div>
                {selectedApplication.result && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Result</p>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                        selectedApplication.result?.toLowerCase() === "pass"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedApplication.result?.toUpperCase()}
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
                  <p className="mt-1 font-medium">#{selectedApplication.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Attempt Number</p>
                  <p className="mt-1 font-medium">
                    #{selectedApplication.attemptNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="mt-1 font-medium">
                    {selectedApplication.applicant?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="mt-1 font-medium break-all">
                    {selectedApplication.applicant?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="mt-1 font-medium">
                    {selectedApplication.applicant?.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="mt-1 font-medium">
                    {selectedApplication.program}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Timeline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="mt-1 font-medium">
                    {formatDate(selectedApplication.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="mt-1 font-medium">
                    {formatDate(selectedApplication.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Schedule Section */}
            {selectedApplication.demoSchedule && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Demo Schedule
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-700">Date & Time</p>
                      <p className="mt-1 font-medium text-blue-900">
                        {formatDate(selectedApplication.demoSchedule)}
                      </p>
                      <p className="text-sm text-blue-800">
                        {selectedApplication.demoTime || "Time not set"}
                      </p>
                    </div>
                    {selectedApplication.demoDuration && (
                      <div>
                        <p className="text-sm text-blue-700">Duration</p>
                        <p className="mt-1 font-medium text-blue-900">
                          {selectedApplication.demoDuration} minutes
                        </p>
                      </div>
                    )}
                    {selectedApplication.demoLocation && (
                      <div className="col-span-1 sm:col-span-2">
                        <p className="text-sm text-blue-700">Location</p>
                        <p className="mt-1 font-medium text-blue-900">
                          {selectedApplication.demoLocation}
                        </p>
                      </div>
                    )}
                    {selectedApplication.demoNotes && (
                      <div className="col-span-1 sm:col-span-2">
                        <p className="text-sm text-blue-700 mb-1">
                          Instructions
                        </p>
                        <p className="text-sm text-blue-800 bg-white rounded p-2">
                          {selectedApplication.demoNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Assessment Score */}
            {selectedApplication.totalScore !== null &&
              selectedApplication.totalScore !== undefined && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Assessment Score
                  </h3>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-blue-600">
                        {selectedApplication.totalScore}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Total Score</p>
                    </div>
                  </div>
                </div>
              )}

            {/* HR Notes */}
            {selectedApplication.hrNotes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  HR Notes
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {selectedApplication.hrNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Documents */}
            {selectedApplication.documents &&
              (() => {
                try {
                  const docs = JSON.parse(selectedApplication.documents);
                  if (Array.isArray(docs) && docs.length > 0) {
                    return (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-3">
                          Uploaded Documents
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {docs.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                            >
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {doc.originalName ||
                                      doc.fileName ||
                                      `Document ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {doc.mimetype || "Unknown type"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                onClick={() =>
                                  downloadDocument(
                                    selectedApplication.id,
                                    index
                                  )
                                }
                                variant="outline"
                                size="sm"
                                className="ml-2 flex-shrink-0"
                                disabled={downloadingDoc === index}
                              >
                                {downloadingDoc === index ? (
                                  <>
                                    <svg
                                      className="animate-spin w-4 h-4 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      className="w-4 h-4 mr-1"
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
                                    Download
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                } catch (e) {
                  console.error("Error parsing documents:", e);
                }
                return null;
              })()}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setSelectedApplication(null)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              {selectedApplication.status === APPLICATION_STATUS.PENDING && (
                <>
                  <Button
                    onClick={() =>
                      openDecisionModal(selectedApplication, "rejected")
                    }
                    variant="danger"
                    className="w-full sm:w-auto"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() =>
                      openDecisionModal(selectedApplication, "approved")
                    }
                    variant="primary"
                    className="w-full sm:w-auto"
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Decision Modal */}
      {showDecisionModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDecisionModal(false)}
          title={`${
            decision === APPLICATION_STATUS.APPROVED ? "Approve" : "Reject"
          } Application`}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to {decision.toLowerCase()} the application
              from {selectedApplication?.applicant?.name}?
            </p>

            {decision === APPLICATION_STATUS.REJECTED && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide a reason for rejection..."
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowDecisionModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDecision}
                variant={
                  decision === APPLICATION_STATUS.APPROVED
                    ? "primary"
                    : "danger"
                }
                disabled={
                  decision === APPLICATION_STATUS.REJECTED && !reason.trim()
                }
              >
                {decision === APPLICATION_STATUS.APPROVED
                  ? "Approve"
                  : "Reject"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApplicationReview;
