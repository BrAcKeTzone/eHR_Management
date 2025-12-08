import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { formatDate } from "../../utils/formatDate";
import { useApplicationStore } from "../../store/applicationStore";
import { useScheduleStore } from "../../store/scheduleStore";
import { applicationApi } from "../../api/applicationApi";

const InterviewScheduling = () => {
  const navigate = useNavigate();
  const {
    applications,
    getAllApplications,
    getApplicationById,
    loading,
    error,
  } = useApplicationStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { getAvailableSlots } = useScheduleStore();
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  const getMinimumDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getEffectiveMinDate = () => {
    const minDate = getMinimumDate();
    if (selectedApplication?.demoSchedule) {
      const demoDate = new Date(selectedApplication.demoSchedule);
      demoDate.setHours(0, 0, 0, 0);
      const demoDateStr = demoDate.toISOString().split("T")[0];
      return demoDateStr >= minDate ? demoDateStr : minDate;
    }
    return minDate;
  };
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  useEffect(() => {
    // Fetch only interview-eligible applications (passed the demo with score >= 75)
    getAllApplications({ interviewEligible: true });
  }, [getAllApplications]);

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
      if (app.interviewSchedule) {
        const dt = new Date(app.interviewSchedule);
        const dateString = dt.toISOString().split("T")[0];
        setScheduleDate(dateString);
        setSelectedDate(dateString);
        getAvailableSlots(dateString)
          .then(setAvailableSlots)
          .catch(console.warn);
        setRescheduleReason(app.interviewRescheduleReason || "");
        setScheduleTime(
          `${dt.getHours().toString().padStart(2, "0")}:${dt
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setScheduleDate("");
        setScheduleTime("");
      }
    } else {
      (async () => {
        try {
          const res = await getApplicationById(applicationId);
          const appFromApi = res?.application;
          if (appFromApi) {
            setSelectedApplication(appFromApi);
            setShowModal(true);
            setSearchParams({});
            if (appFromApi.interviewSchedule) {
              const dt = new Date(appFromApi.interviewSchedule);
              const dateString = dt.toISOString().split("T")[0];
              setScheduleDate(dateString);
              setSelectedDate(dateString);
              getAvailableSlots(dateString)
                .then(setAvailableSlots)
                .catch(console.warn);
              setRescheduleReason(appFromApi.interviewRescheduleReason || "");
              setScheduleTime(
                `${dt.getHours().toString().padStart(2, "0")}:${dt
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`
              );
            } else {
              setScheduleDate("");
              setScheduleTime("");
            }
          }
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [applications, searchParams, getApplicationById, setSearchParams]);

  const openScheduleModal = (app) => {
    // Prevent rescheduling if already rescheduled once
    if (app.interviewSchedule && (app.interviewRescheduleCount || 0) >= 1) {
      alert(
        "This application has already been rescheduled once and cannot be rescheduled again."
      );
      return;
    }
    setSelectedApplication(app);
    setShowModal(true);
    // preselect date and fetch available slots if interview already scheduled
    if (app?.interviewSchedule) {
      const dt = new Date(app.interviewSchedule);
      const dateString = dt.toISOString().split("T")[0];
      setScheduleDate(dateString);
      setScheduleTime(
        `${dt.getHours().toString().padStart(2, "0")}:${dt
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
      setSelectedDate(dateString);
      getAvailableSlots(dateString).then(setAvailableSlots).catch(console.warn);
    } else {
      setScheduleDate("");
      setScheduleTime("");
      setRescheduleReason("");
      setSelectedDate("");
      setAvailableSlots([]);
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
      header: "Submitted",
      accessor: "createdAt",
      cell: (row) => (
        <div className="text-sm text-gray-600">{formatDate(row.createdAt)}</div>
      ),
    },
    {
      header: "Demo Schedule",
      accessor: "demoSchedule",
      cell: (row) => (
        <div className="text-sm">
          {row.demoSchedule ? (
            <div>
              <p className="font-medium text-gray-700">
                {formatDate(row.demoSchedule)}
              </p>
              {row.demoTime && (
                <p className="text-gray-600 font-medium">{row.demoTime}</p>
              )}
            </div>
          ) : (
            <span className="text-yellow-600 font-medium">Pending</span>
          )}
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
              {row.interviewRescheduleReason && (
                <p className="mt-1 text-xs text-gray-500">
                  Reason:{" "}
                  {row.interviewRescheduleReason === "APPLICANT_NO_SHOW"
                    ? "Applicant did not appear"
                    : row.interviewRescheduleReason === "SCHOOL"
                    ? "Rescheduled by school"
                    : row.interviewRescheduleReason}
                </p>
              )}
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
            onClick={() => openScheduleModal(row)}
            variant={row.interviewSchedule ? "outline" : "primary"}
            size="sm"
            disabled={
              row.interviewSchedule && (row.interviewRescheduleCount || 0) >= 1
            }
          >
            {row.interviewSchedule
              ? (row.interviewRescheduleCount || 0) >= 1
                ? "Rescheduled"
                : "Reschedule"
              : "Schedule"}
          </Button>
        </div>
      ),
    },
  ];

  // Only show applications that are interviewEligible or have a passing demo score
  const visibleApplications = (applications || []).filter((a) => {
    return (
      a.interviewEligible ||
      (typeof a.totalScore === "number" && a.totalScore >= 75)
    );
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Interview Scheduling
        </h1>
        <p className="text-gray-600">Schedule interviews for applicants.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <DashboardCard title="Total Approved" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {(applications || []).filter((a) => a.status === "APPROVED").length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Applications</div>
        </DashboardCard>

        <DashboardCard title="Pending Interviews" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
            {
              (applications || []).filter(
                (a) => a.status === "APPROVED" && !a.interviewSchedule
              ).length
            }
          </div>
          <div className="text-sm text-gray-500 mt-1">Need scheduling</div>
        </DashboardCard>
      </div>

      <DashboardCard title="Applications">
        <div className="mt-4">
          <div className="hidden lg:block">
            <Table columns={columns} data={visibleApplications} />
          </div>

          <div className="lg:hidden space-y-4">
            {visibleApplications.map((app, idx) => (
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
                    <span className="text-gray-500">Demo Schedule:</span>
                    {app.demoSchedule ? (
                      <div className="mt-1">
                        <p className="font-medium text-green-600">Scheduled</p>
                        <p className="text-gray-600">
                          {formatDate(app.demoSchedule)}
                        </p>
                        {app.demoTime && (
                          <p className="text-gray-600 font-medium">
                            {app.demoTime}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-yellow-600 font-medium">Pending</p>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <p className="font-medium">{formatDate(app.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Interview Schedule:</span>
                    {app.interviewSchedule ? (
                      <div className="mt-1">
                        <p className="font-medium text-green-600">Scheduled</p>
                        <p className="text-gray-600">
                          {formatDate(app.interviewSchedule)}
                        </p>
                        {app.interviewTime && (
                          <p className="text-gray-600 font-medium">
                            {app.interviewTime}
                          </p>
                        )}
                        {app.interviewRescheduleReason && (
                          <p className="mt-1 text-xs text-gray-500">
                            Reason:{" "}
                            {app.interviewRescheduleReason ===
                            "APPLICANT_NO_SHOW"
                              ? "Applicant did not appear"
                              : app.interviewRescheduleReason === "SCHOOL"
                              ? "Rescheduled by school"
                              : app.interviewRescheduleReason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-yellow-600 font-medium">Pending</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => openScheduleModal(app)}
                    variant={app.interviewSchedule ? "outline" : "primary"}
                    size="sm"
                    className="flex-1"
                    disabled={
                      app.interviewSchedule &&
                      (app.interviewRescheduleCount || 0) >= 1
                    }
                  >
                    {app.interviewSchedule
                      ? (app.interviewRescheduleCount || 0) >= 1
                        ? "Rescheduled"
                        : "Reschedule"
                      : "Schedule"}
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
            setRescheduleReason("");
            setScheduleDate("");
            setScheduleTime("");
            setAvailableSlots([]);
            setSelectedDate("");
          }}
          title={`Schedule Interview - ${selectedApplication.applicant?.firstName} ${selectedApplication.applicant?.lastName}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Applicant Info */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                Applicant Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 break-all">
                    {selectedApplication.applicant?.email}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Interview Date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => {
                    setScheduleDate(e.target.value);
                    setSelectedDate(e.target.value);
                    // reset time if date changed
                    setScheduleTime("");
                    if (e.target.value) {
                      getAvailableSlots(e.target.value)
                        .then(setAvailableSlots)
                        .catch(console.warn);
                    } else {
                      setAvailableSlots([]);
                    }
                  }}
                  required
                  min={getEffectiveMinDate()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Time <span className="text-red-500">*</span>
                </label>
                <select
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a time</option>
                  {(() => {
                    const slots = [];
                    for (let hour = 8; hour <= 17; hour++) {
                      for (let minute = 0; minute < 60; minute += 30) {
                        const time = `${hour
                          .toString()
                          .padStart(2, "0")}:${minute
                          .toString()
                          .padStart(2, "0")}`;
                        slots.push(time);
                      }
                    }
                    return slots.map((time) => (
                      <option
                        key={time}
                        value={time}
                        disabled={availableSlots.includes(time)}
                      >
                        {time}{" "}
                        {availableSlots.includes(time) && "(Unavailable)"}
                      </option>
                    ));
                  })()}
                </select>
              </div>
            </div>

            {/* Reschedule Reason (only shown when editing existing schedule) */}
            {selectedApplication.interviewSchedule && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reschedule Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select reason</option>
                  <option value="APPLICANT_NO_SHOW">
                    Applicant did not appear
                  </option>
                  <option value="SCHOOL">Rescheduled by school</option>
                </select>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={() => {
                  setShowModal(false);
                  setSelectedApplication(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!scheduleDate || !scheduleTime) return;
                  try {
                    // Validate interview date not earlier than demo schedule (if demo exists)
                    if (selectedApplication?.demoSchedule) {
                      const demoDate = new Date(
                        selectedApplication.demoSchedule
                      );
                      demoDate.setHours(0, 0, 0, 0);
                      const interviewDt = new Date(
                        `${scheduleDate}T${scheduleTime}:00.000`
                      );
                      interviewDt.setHours(0, 0, 0, 0);
                      if (interviewDt.getTime() < demoDate.getTime()) {
                        alert(
                          `Interview date must be on or after the demo scheduled on ${formatDate(
                            selectedApplication.demoSchedule
                          )}`
                        );
                        return;
                      }
                    }

                    // If updating an existing interview and rescheduling, require a reason
                    if (selectedApplication?.interviewSchedule) {
                      if (!rescheduleReason) {
                        alert(
                          "Please select a reason for rescheduling the interview."
                        );
                        return;
                      }
                    }

                    const isoString = `${scheduleDate}T${scheduleTime}:00.000`;
                    await applicationApi.scheduleInterview(
                      selectedApplication.id,
                      isoString,
                      rescheduleReason || undefined
                    );
                    setShowModal(false);
                    setSelectedApplication(null);
                    // Refresh interview-scheduling list
                    getAllApplications({ interviewEligible: true });
                  } catch (err) {
                    console.error(err);
                    alert(err.message || "Failed to schedule interview");
                  }
                }}
                variant="primary"
              >
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InterviewScheduling;
