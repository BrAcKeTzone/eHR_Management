import React, { useState, useEffect } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import { useAuthStore } from "../../store/authStore";
import StatusBadge from "../../components/StatusBadge";
import StatusTracker from "../../components/StatusTracker";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import ApplicationDetailsModal from "../../components/ApplicationDetailsModal";

const ApplicationHistory = () => {
  const { user } = useAuthStore();
  const { applications, loading, fetchApplications } = useApplicationStore();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const userApplications = applications || [];

  const getStatusColor = (status) => {
    if (!status) return "gray";
    switch (status.toLowerCase()) {
      case "pending":
        return "yellow";
      case "under review":
        return "blue";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "completed":
        return "green";
      default:
        return "gray";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return String(dateString);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return String(dateString);
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return "Not scheduled";
    // schedule may be an object ({ date, time, location, notes }) or a string
    if (typeof schedule === "string") return formatDateTime(schedule);
    if (typeof schedule === "object") {
      const date =
        schedule.date ||
        schedule.datetime ||
        schedule.scheduledAt ||
        schedule.time;
      const time = schedule.time || schedule.duration || schedule.datetime;
      const dateLabel = date ? formatDate(date) : "Not scheduled";
      return time ? `${dateLabel} at ${time}` : dateLabel;
    }
    return String(schedule);
  };

  const getApplicationProgress = (application) => {
    const stages = [
      "Submitted",
      "Under Review",
      "Demo Scheduled",
      "Interview Scheduled",
      "Completed",
    ];

    const hasInterview = Boolean(
      application?.interviewSchedule || application?.interview_schedule,
    );
    const hasDemo = Boolean(
      application?.demoSchedule || application?.demo_schedule,
    );
    const status = application?.status?.toLowerCase?.() || "";

    let currentIndex = 0;
    if (status === "completed") {
      currentIndex = stages.length - 1;
    } else if (hasInterview) {
      currentIndex = stages.indexOf("Interview Scheduled");
    } else if (hasDemo) {
      currentIndex = stages.indexOf("Demo Scheduled");
    } else if (status === "under review") {
      currentIndex = stages.indexOf("Under Review");
    } else {
      currentIndex = stages.indexOf("Submitted");
    }

    return { stages, currentIndex: Math.max(0, currentIndex) };
  };

  const renderApplicationCard = (application) => {
    const { stages, currentIndex } = getApplicationProgress(application);
    const progressPercent = Math.round(
      ((currentIndex + 1) / stages.length) * 100,
    );

    return (
      <div
        key={application.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedApplication(application)}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {application.subject_specialization ||
                application.subjectSpecialization ||
                "Teaching Application"}
            </h3>
            <p className="text-sm text-gray-600">
              {application.subject_specialization ||
                application.subjectSpecialization ||
                "Teaching Position"}
            </p>
          </div>
          <StatusBadge
            status={application.status}
            variant={getStatusColor(application.status)}
          />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Application ID:</span>
            <span className="font-medium text-gray-900">#{application.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Submitted:</span>
            <span className="text-gray-900">
              {formatDate(application.created_at || application.submittedAt)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Updated:</span>
            <span className="text-gray-900">
              {formatDate(application.updated_at || application.updatedAt)}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {Array.isArray(application.documents)
              ? application.documents.length
              : 0}{" "}
            documents uploaded
          </span>
          <span className="text-blue-600 font-medium">View Details →</span>
        </div>
      </div>
    );
  };

  const renderApplicationRow = (application) => {
    const { stages, currentIndex } = getApplicationProgress(application);
    const progressPercent = Math.round(
      ((currentIndex + 1) / stages.length) * 100,
    );

    return (
      <tr
        key={application.id}
        className="hover:bg-gray-50 cursor-pointer"
        onClick={() => setSelectedApplication(application)}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm font-medium text-gray-900">
              #{application.id}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(application.created_at || application.submittedAt)}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm text-gray-500">
              {application.subject_specialization ||
                application.subjectSpecialization ||
                "Teaching Position"}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge
            status={application.status}
            variant={getStatusColor(application.status)}
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(application.updated_at || application.updatedAt)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className="flex items-center">
            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-gray-600">{progressPercent}%</span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <span className="text-blue-600 hover:text-blue-900">View</span>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Application History
          </h1>
          <p className="text-gray-600 mt-1">
            View all your teaching applications and their current status
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              List
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {userApplications.length} application
            {userApplications.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Content */}
      {userApplications.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No applications yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't submitted any teaching applications.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => (window.location.href = "/applicant/application")}
              variant="primary"
            >
              Submit New Application
            </Button>
          </div>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userApplications.map(renderApplicationCard)}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program & Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userApplications.map(renderApplicationRow)}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          isOpen={true}
          application={{
            ...selectedApplication,
            applicant: selectedApplication.applicant || user,
          }}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
};

export default ApplicationHistory;
