import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { formatDate } from "../../utils/formatDate";

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
    program: "",
    search: "",
    startDate: "",
    endDate: "",
    result: "",
  });

  useEffect(() => {
    getAllApplications();
  }, [getAllApplications]);
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
      const matchesProgram =
        !filters.program ||
        app.program.toLowerCase().includes(filters.program.toLowerCase());
      const matchesSearch =
        !filters.search ||
        app.applicant_name
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        app.applicant_email
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());
      const matchesStartDate =
        !filters.startDate ||
        new Date(app.created_at) >= new Date(filters.startDate);
      const matchesEndDate =
        !filters.endDate ||
        new Date(app.created_at) <= new Date(filters.endDate);
      const matchesResult = !filters.result || app.result === filters.result;

      return (
        matchesStatus &&
        matchesProgram &&
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
      const history = await getApplicationHistory(application.applicant_email);
      setApplicationHistory(history);
      setSelectedApplication(application);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Failed to fetch application history:", error);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus, reason = "") => {
    try {
      await updateApplicationStatus(applicationId, newStatus, reason);
      getAllApplications(); // Refresh the list
    } catch (error) {
      console.error("Failed to update application status:", error);
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
      header: "Result",
      accessor: "result",
      cell: (row) => (
        <div className="text-sm">
          {row.result ? (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(
                row.result
              )}`}
            >
              {row.result?.toUpperCase()}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      header: "Score",
      accessor: "total_score",
      cell: (row) => (
        <div className="text-sm">
          {row.total_score ? (
            <span className="font-medium">{row.total_score}%</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
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
      header: "Demo Schedule",
      accessor: "demo_schedule",
      cell: (row) => (
        <div className="text-sm">
          {row.demo_schedule ? (
            <div>
              <p className="text-gray-900">
                {formatDate(row.demo_schedule.date)}
              </p>
              <p className="text-gray-600">{row.demo_schedule.time}</p>
            </div>
          ) : (
            <span className="text-gray-400">Not scheduled</span>
          )}
        </div>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          {
            title: "Total",
            value: filteredApplications.length,
            color: "text-blue-600",
          },
          {
            title: "Pending",
            value: filteredApplications.filter(
              (app) => app.status === "pending"
            ).length,
            color: "text-yellow-600",
          },
          {
            title: "Approved",
            value: filteredApplications.filter(
              (app) => app.status === "approved"
            ).length,
            color: "text-green-600",
          },
          {
            title: "Rejected",
            value: filteredApplications.filter(
              (app) => app.status === "rejected"
            ).length,
            color: "text-red-600",
          },
          {
            title: "Completed",
            value: filteredApplications.filter(
              (app) => app.status === "completed"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

          <Input
            label="Program"
            value={filters.program}
            onChange={(e) =>
              setFilters({ ...filters, program: e.target.value })
            }
            placeholder="Filter by program"
          />

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
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() =>
              setFilters({
                status: "",
                program: "",
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
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {app.applicant_name}
                      </h3>
                      <p className="text-sm text-gray-500 break-all">
                        {app.applicant_email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Attempt #{app.attempt_number}
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
                      <span className="text-gray-500">Program:</span>
                      <p className="font-medium">{app.program}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Score:</span>
                      <p className="font-medium">
                        {app.total_score ? `${app.total_score}%` : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted:</span>
                      <p>{formatDate(app.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Demo:</span>
                      <p>
                        {app.demo_schedule
                          ? formatDate(app.demo_schedule.date)
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
          title={`Application Details - ${selectedApplication.applicant_name}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 break-all">
                  {selectedApplication.applicant_email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Program</p>
                <p className="mt-1 break-words">
                  {selectedApplication.program}
                </p>
              </div>
            </div>

            {selectedApplication.demo_schedule && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Demo Schedule
                </p>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="break-words">
                    {formatDate(selectedApplication.demo_schedule.date)} at{" "}
                    {selectedApplication.demo_schedule.time}
                  </p>
                  {selectedApplication.demo_schedule.location && (
                    <p className="text-sm text-gray-600 break-words">
                      Location: {selectedApplication.demo_schedule.location}
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedApplication.total_score && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Score & Result
                </p>
                <div className="mt-1 p-3 bg-gray-50 rounded-md flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <span className="text-lg font-bold">
                    {selectedApplication.total_score}%
                  </span>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getResultColor(
                      selectedApplication.result
                    )}`}
                  >
                    {selectedApplication.result?.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {selectedApplication.feedback && (
              <div>
                <p className="text-sm font-medium text-gray-500">Feedback</p>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700 break-words">
                    {selectedApplication.feedback}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
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
          title={`Application History - ${selectedApplication.applicant_name}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
            <div className="text-sm text-gray-600 break-words">
              All applications from {selectedApplication.applicant_email}
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
                          Attempt #{app.attempt_number}
                        </h4>
                        <p className="text-sm text-gray-600 break-words">
                          {app.program}
                        </p>
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
                          {formatDate(app.created_at)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Updated:</span>
                        <span className="ml-2 break-words">
                          {formatDate(app.updated_at)}
                        </span>
                      </div>
                      {app.total_score && (
                        <div>
                          <span className="text-gray-500">Score:</span>
                          <span className="ml-2 font-medium">
                            {app.total_score}%
                          </span>
                        </div>
                      )}
                      {app.demo_schedule && (
                        <div>
                          <span className="text-gray-500">Demo:</span>
                          <span className="ml-2 break-words">
                            {formatDate(app.demo_schedule.date)}
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
