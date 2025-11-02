import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { formatDate } from "../../utils/formatDate";
import { APPLICATION_STATUS, APPLICATION_RESULT } from "../../utils/constants";

const ApplicationsManagement = () => {
  const {
    applications,
    getAllApplications,
    getApplicationHistory,
    updateApplicationStatus,
    loading,
    error,
  } = useApplicationStore();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [applicationHistory, setApplicationHistory] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    startDate: "",
    endDate: "",
    result: "",
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

  const filteredApplications =
    applications?.filter((app) => {
      const matchesStatus = !filters.status || app.status === filters.status;
      const matchesSearch =
        !filters.search ||
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
          .includes(filters.search.toLowerCase());
      const matchesStartDate =
        !filters.startDate ||
        new Date(app.createdAt) >= new Date(filters.startDate);
      const matchesEndDate =
        !filters.endDate ||
        new Date(app.createdAt) <= new Date(filters.endDate);
      const matchesResult = !filters.result || app.result === filters.result;

      return (
        matchesStatus &&
        matchesSearch &&
        matchesStartDate &&
        matchesEndDate &&
        matchesResult
      );
    }) || [];

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleViewHistory = async (application) => {
    try {
      const result = await getApplicationHistory(application.applicant?.email);
      // Extract applications array from the result object
      setApplicationHistory(result?.applications || []);
      setSelectedApplication(application);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Failed to fetch application history:", error);
      setApplicationHistory([]); // Set empty array on error
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus, reason = "") => {
    try {
      await updateApplicationStatus(applicationId, newStatus, reason);
      getAllApplications(filters); // Refresh the list with current filters
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  };

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
      header: "Status / Result",
      accessor: "status",
      cell: (row) => (
        <div className="space-y-1">
          <div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                row.status
              )}`}
            >
              {row.status?.toUpperCase()}
            </span>
          </div>
          {row.result && (
            <div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                  row.result
                )}`}
              >
                {row.result?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Score",
      accessor: "totalScore",
      cell: (row) => (
        <div className="text-sm">
          {row.totalScore !== null && row.totalScore !== undefined ? (
            <span className="font-medium">{row.totalScore}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
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
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-1">
          <Button
            onClick={() => handleViewDetails(row)}
            variant="outline"
            size="sm"
          >
            View
          </Button>
          <Button
            onClick={() => handleViewHistory(row)}
            variant="outline"
            size="sm"
          >
            History
          </Button>
        </div>
      ),
    },
  ];

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
          Applications Management
        </h1>
        <p className="text-gray-600">
          View and manage all applications with filtering and history tracking.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          {
            title: "Total",
            value: filteredApplications.length,
            color: "text-blue-600",
          },
          {
            title: "Pending",
            value: filteredApplications.filter(
              (app) => app.status === APPLICATION_STATUS.PENDING
            ).length,
            color: "text-yellow-600",
          },
          {
            title: "Approved",
            value: filteredApplications.filter(
              (app) => app.status === APPLICATION_STATUS.APPROVED
            ).length,
            color: "text-green-600",
          },
          {
            title: "Rejected",
            value: filteredApplications.filter(
              (app) => app.status === APPLICATION_STATUS.REJECTED
            ).length,
            color: "text-red-600",
          },
          {
            title: "Completed",
            value: filteredApplications.filter(
              (app) => app.status === APPLICATION_STATUS.COMPLETED
            ).length,
            color: "text-purple-600",
          },
        ].map((stat, index) => (
          <DashboardCard key={index} title={stat.title} className="text-center">
            <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </DashboardCard>
        ))}
      </div>

      {/* Filters */}
      <DashboardCard title="Filter Applications" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

          <Input
            label="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Name or email"
          />

          <Input
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />

          <Input
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Result
            </label>
            <select
              value={filters.result}
              onChange={(e) =>
                setFilters({ ...filters, result: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Results</option>
              <option value={APPLICATION_RESULT.PASS}>Pass</option>
              <option value={APPLICATION_RESULT.FAIL}>Fail</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() =>
              setFilters({
                status: "",
                search: "",
                startDate: "",
                endDate: "",
                result: "",
              })
            }
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      </DashboardCard>

      {/* Applications Table */}
      <DashboardCard title={`Applications (${filteredApplications.length})`}>
        {filteredApplications.length > 0 ? (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table
                columns={applicationsColumns}
                data={filteredApplications}
              />
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
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
                      <p className="text-sm text-gray-500 break-all">
                        {app.applicant?.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Attempt #{app.attemptNumber}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status?.toUpperCase()}
                      </span>
                      {app.result && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                            app.result
                          )}`}
                        >
                          {app.result?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Score:</span>
                      <p className="font-medium">
                        {app.totalScore !== null && app.totalScore !== undefined
                          ? app.totalScore
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted:</span>
                      <p>{formatDate(app.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Demo:</span>
                      <p>
                        {app.demoSchedule
                          ? formatDate(app.demoSchedule)
                          : "Not scheduled"}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleViewDetails(app)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleViewHistory(app)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      History
                    </Button>
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

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <Modal
          isOpen={true}
          onClose={() => setShowDetailsModal(false)}
          title={`Application Details - ${selectedApplication.applicant?.firstName} ${selectedApplication.applicant?.lastName}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
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
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getResultColor(
                        selectedApplication.result
                      )}`}
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
                    {selectedApplication.applicant?.firstName}{" "}
                    {selectedApplication.applicant?.lastName}
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
              </div>
            </div>

            {/* Timeline */}
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

            {/* Demo Schedule */}
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
                        <p className="mt-1 font-medium text-blue-900 break-words">
                          {selectedApplication.demoLocation}
                        </p>
                      </div>
                    )}
                    {selectedApplication.demoNotes && (
                      <div className="col-span-1 sm:col-span-2">
                        <p className="text-sm text-blue-700 mb-1">
                          Instructions
                        </p>
                        <p className="text-sm text-blue-800 bg-white rounded p-2 break-words">
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

            {/* HR Notes / Rejection Reason */}
            {selectedApplication.hrNotes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {selectedApplication.status === "REJECTED"
                    ? "Rejection Reason"
                    : "HR Notes"}
                </h3>
                <div
                  className={`p-4 rounded-lg ${
                    selectedApplication.status === "REJECTED"
                      ? "bg-red-50 border border-red-200"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <p
                    className={`text-sm break-words ${
                      selectedApplication.status === "REJECTED"
                        ? "text-red-800"
                        : "text-gray-700"
                    }`}
                  >
                    {selectedApplication.hrNotes}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={() => setShowDetailsModal(false)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Application History Modal */}
      {showHistoryModal && selectedApplication && (
        <Modal
          isOpen={true}
          onClose={() => setShowHistoryModal(false)}
          title={`Application History - ${selectedApplication.applicant?.firstName} ${selectedApplication.applicant?.lastName}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
            <div className="text-sm text-gray-600 break-words">
              All applications from {selectedApplication.applicant?.email}
            </div>

            {applicationHistory.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {applicationHistory.map((app, index) => (
                  <div
                    key={app.id}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">
                          Attempt #{app.attemptNumber}
                        </h4>
                      </div>
                      <div className="flex flex-row sm:flex-col sm:text-right gap-2 sm:gap-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status?.toUpperCase()}
                        </span>
                        {app.result && (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                              app.result
                            )}`}
                          >
                            {app.result?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <span className="ml-2 break-words">
                          {formatDate(app.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Updated:</span>
                        <span className="ml-2 break-words">
                          {formatDate(app.updatedAt)}
                        </span>
                      </div>
                      {app.totalScore !== null &&
                        app.totalScore !== undefined && (
                          <div>
                            <span className="text-gray-500">Score:</span>
                            <span className="ml-2 font-medium">
                              {app.totalScore}
                            </span>
                          </div>
                        )}
                      {app.demoSchedule && (
                        <div>
                          <span className="text-gray-500">Demo:</span>
                          <span className="ml-2 break-words">
                            {formatDate(app.demoSchedule)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-500">
                  No application history found for this applicant.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setShowHistoryModal(false)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApplicationsManagement;
