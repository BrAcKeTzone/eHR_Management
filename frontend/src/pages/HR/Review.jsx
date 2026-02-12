import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../store/applicationStore";
import { applicationApi } from "../../api/applicationApi";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import ApplicationDetailsModal from "../../components/ApplicationDetailsModal";
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
  const [downloadingDoc, setDownloadingDoc] = useState(null);
  const [filters, setFilters] = useState({
    status: APPLICATION_STATUS.PENDING,
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

  const navigate = useNavigate();

  const handleDecision = async () => {
    if (!selectedApplication || !decision) return;

    try {
      const res = await updateApplicationStatus(
        selectedApplication.id,
        decision,
        reason,
      );

      setShowDecisionModal(false);
      setSelectedApplication(null);
      setDecision("");
      setReason("");
      getAllApplications(filters);

      if (
        decision === APPLICATION_STATUS.APPROVED ||
        decision.toLowerCase() === "approved"
      ) {
        const appId = res?.application?.id || selectedApplication.id;
        navigate(`/hr/scheduling?applicationId=${appId}`);
      }
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  };

  const openDecisionModal = (application, decisionType) => {
    setSelectedApplication(application);
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
        (!filters.search ||
          (app.applicant?.firstName &&
            app.applicant.firstName
              ?.toLowerCase()
              .includes(filters.search.toLowerCase())) ||
          (app.applicant?.lastName &&
            app.applicant.lastName
              ?.toLowerCase()
              .includes(filters.search.toLowerCase())) ||
          app.applicant?.email
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()))
      );
    }) || [];

  const applicationsColumns = [
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
          <p className="text-xs text-gray-400">Attempt #{row.attemptNumber}</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            row.status,
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
                        {app.applicant?.firstName} {app.applicant?.lastName}
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
                        app.status,
                      )}`}
                    >
                      {app.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
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
        <ApplicationDetailsModal
          isOpen={!!selectedApplication && !showDecisionModal}
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onGoToReview={() => {
            setSelectedApplication(null);
          }}
        />
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
              from {selectedApplication?.applicant?.firstName}{" "}
              {selectedApplication?.applicant?.lastName}?
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
