import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import { formatDate } from "../../utils/formatDate";

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
  const [filters, setFilters] = useState({
    status: "pending",
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
    setDecision(decisionType);
    setShowDecisionModal(true);
  };

  const downloadDocument = async (applicationId, documentName) => {
    // Implementation for downloading documents
    console.log("Download document:", applicationId, documentName);
  };

  const filteredApplications =
    applications?.filter((app) => {
      return (
        (!filters.status || app.status === filters.status) &&
        (!filters.program ||
          app.program.toLowerCase().includes(filters.program.toLowerCase())) &&
        (!filters.search ||
          app.applicant_name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          app.applicant_email
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()))
      );
    }) || [];

  const applicationsColumns = [
    {
      header: "Applicant",
      accessor: "applicant_name",
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.applicant_name}</p>
          <p className="text-sm text-gray-500">{row.applicant_email}</p>
          <p className="text-xs text-gray-400">Attempt #{row.attempt_number}</p>
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
      accessor: "created_at",
      cell: (row) => (
        <div className="text-sm text-gray-600">
          {formatDate(row.created_at)}
        </div>
      ),
    },
    {
      header: "Documents",
      accessor: "documents",
      cell: (row) => (
        <div className="text-sm">{row.documents?.length || 0} files</div>
      ),
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
          {row.status === "pending" && (
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
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
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {app.applicant_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {app.applicant_email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Attempt #{app.attempt_number}
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
                      <p className="text-sm">{formatDate(app.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Documents:</span>
                      <p className="text-sm">
                        {app.documents?.length || 0} files
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
                    {app.status === "pending" && (
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
          title={`Application Details - ${selectedApplication.applicant_name}`}
          size="large"
        >
          <div className="space-y-6 max-h-96 sm:max-h-none overflow-y-auto">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    selectedApplication.status
                  )}`}
                >
                  {selectedApplication.status?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Attempt Number
                </p>
                <p className="mt-1">#{selectedApplication.attempt_number}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 break-all">
                  {selectedApplication.applicant_email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1">
                  {selectedApplication.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Program</p>
              <p className="mt-1">{selectedApplication.program}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="mt-1">
                {selectedApplication.address || "Not provided"}
              </p>
            </div>

            {/* Educational Background */}
            {selectedApplication.education && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Educational Background
                </p>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    {selectedApplication.education}
                  </p>
                </div>
              </div>
            )}

            {/* Teaching Experience */}
            {selectedApplication.experience && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Teaching Experience
                </p>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    {selectedApplication.experience}
                  </p>
                </div>
              </div>
            )}

            {/* Motivation */}
            {selectedApplication.motivation && (
              <div>
                <p className="text-sm font-medium text-gray-500">Motivation</p>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    {selectedApplication.motivation}
                  </p>
                </div>
              </div>
            )}

            {/* Documents */}
            {selectedApplication.documents &&
              selectedApplication.documents.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-3">
                    Uploaded Documents
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedApplication.documents.map((doc, index) => (
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
                              {doc.name || `Document ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doc.type || "Unknown type"}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() =>
                            downloadDocument(selectedApplication.id, doc.name)
                          }
                          variant="outline"
                          size="sm"
                          className="ml-2 flex-shrink-0"
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setSelectedApplication(null)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              {selectedApplication.status === "pending" && (
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
            decision === "approved" ? "Approve" : "Reject"
          } Application`}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to {decision} the application from{" "}
              {selectedApplication?.applicant_name}?
            </p>

            {decision === "rejected" && (
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
                variant={decision === "approved" ? "primary" : "danger"}
                disabled={decision === "rejected" && !reason.trim()}
              >
                {decision === "approved" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApplicationReview;
