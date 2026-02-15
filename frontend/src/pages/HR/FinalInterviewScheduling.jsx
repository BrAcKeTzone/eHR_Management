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

const FinalInterviewScheduling = () => {
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
      (a) => String(a.id) === String(applicationId),
    );
    if (app) {
      setSelectedApplication(app);
      setShowModal(true);
      setSearchParams({});
      if (app.finalInterviewSchedule) {
        const dt = new Date(app.finalInterviewSchedule);
        const dateString = dt.toISOString().split("T")[0];
        setScheduleDate(dateString);
        setSelectedDate(dateString);
        getAvailableSlots(dateString)
          .then(setAvailableSlots)
          .catch(console.warn);
        setRescheduleReason(app.finalInterviewRescheduleReason || "");
        setScheduleTime(
          `${dt.getHours().toString().padStart(2, "0")}:${dt
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
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
            if (appFromApi.finalInterviewSchedule) {
              const dt = new Date(appFromApi.finalInterviewSchedule);
              const dateString = dt.toISOString().split("T")[0];
              setScheduleDate(dateString);
              setSelectedDate(dateString);
              getAvailableSlots(dateString)
                .then(setAvailableSlots)
                .catch(console.warn);
              setRescheduleReason(
                appFromApi.finalInterviewRescheduleReason || "",
              );
              setScheduleTime(
                `${dt.getHours().toString().padStart(2, "0")}:${dt
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`,
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
    const initialResult = (app.initialInterviewResult || "")
      .toString()
      .toUpperCase();
    if (initialResult !== "PASS") {
      alert(
        "Final interview can only be scheduled after a PASS initial interview result.",
      );
      return;
    }
    // Prevent rescheduling if already rescheduled once
    if (
      app.finalInterviewSchedule &&
      (app.finalInterviewRescheduleCount || 0) >= 1
    ) {
      alert(
        "This application has already been rescheduled once and cannot be rescheduled again.",
      );
      return;
    }
    // Prevent scheduling/rescheduling if the interview has already been rated
    if (app.finalInterviewResult || app.interviewResult) {
      alert(
        "This application has already been rated and cannot be scheduled or rescheduled.",
      );
      return;
    }
    setSelectedApplication(app);
    setShowModal(true);
    // preselect date and fetch available slots if interview already scheduled
    if (app?.finalInterviewSchedule) {
      const dt = new Date(app.finalInterviewSchedule);
      const dateString = dt.toISOString().split("T")[0];
      setScheduleDate(dateString);
      setScheduleTime(
        `${dt.getHours().toString().padStart(2, "0")}:${dt
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
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
      header: "Final Interview Schedule",
      accessor: "finalInterviewSchedule",
      cell: (row) => (
        <div className="text-sm">
          {row.finalInterviewSchedule ? (
            <div>
              <p className="font-medium text-green-600">Scheduled</p>
              <p className="text-gray-600">
                {formatDate(row.finalInterviewSchedule)}
              </p>
              {row.finalInterviewTime && (
                <p className="text-gray-600 font-medium">
                  {row.finalInterviewTime}
                </p>
              )}
              {row.finalInterviewRescheduleReason && (
                <p className="mt-1 text-xs text-gray-500">
                  Reason:{" "}
                  {row.finalInterviewRescheduleReason === "APPLICANT_NO_SHOW"
                    ? "Applicant did not appear"
                    : row.finalInterviewRescheduleReason === "SCHOOL"
                      ? "Rescheduled by school"
                      : row.finalInterviewRescheduleReason}
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
            variant={row.finalInterviewSchedule ? "outline" : "primary"}
            size="sm"
            disabled={!!row.finalInterviewResult || !!row.interviewResult}
          >
            {row.finalInterviewSchedule
              ? row.finalInterviewResult || row.interviewResult
                ? "Interviewed"
                : (row.finalInterviewRescheduleCount || 0) >= 1
                  ? "Rescheduled"
                  : "Reschedule"
              : "Schedule"}
          </Button>
        </div>
      ),
    },
  ];

  // Only show applications that are interviewEligible or have a passing demo score
  // Require initial interview PASS and exclude applications with a final interview result
  const visibleApplications = (applications || []).filter((a) => {
    const eligible =
      a.interviewEligible ||
      (typeof a.totalScore === "number" && a.totalScore >= 75);
    const initialResult = (a.initialInterviewResult || "")
      .toString()
      .trim()
      .toUpperCase();
    const finalResult = (a.finalInterviewResult || "").toString().trim();
    const fallbackResult = (a.interviewResult || "").toString().trim();
    return (
      eligible &&
      initialResult === "PASS" &&
      finalResult === "" &&
      fallbackResult === ""
    );
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Final Interview Scheduling
        </h1>
        <p className="text-gray-600">
          Schedule final interviews for applicants.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

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
                    <span className="text-gray-500">
                      Final Interview Schedule:
                    </span>
                    {app.finalInterviewSchedule ? (
                      <div className="mt-1">
                        <p className="font-medium text-green-600">Scheduled</p>
                        <p className="text-gray-600">
                          {formatDate(app.finalInterviewSchedule)}
                        </p>
                        {app.finalInterviewTime && (
                          <p className="text-gray-600 font-medium">
                            {app.finalInterviewTime}
                          </p>
                        )}
                        {app.finalInterviewRescheduleReason && (
                          <p className="mt-1 text-xs text-gray-500">
                            Reason:{" "}
                            {app.finalInterviewRescheduleReason ===
                            "APPLICANT_NO_SHOW"
                              ? "Applicant did not appear"
                              : app.finalInterviewRescheduleReason === "SCHOOL"
                                ? "Rescheduled by school"
                                : app.finalInterviewRescheduleReason}
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
                    variant={app.finalInterviewSchedule ? "outline" : "primary"}
                    size="sm"
                    className="flex-1"
                    disabled={
                      !!app.finalInterviewResult || !!app.interviewResult
                    }
                  >
                    {app.finalInterviewSchedule
                      ? app.finalInterviewResult || app.interviewResult
                        ? "Interviewed"
                        : (app.finalInterviewRescheduleCount || 0) >= 1
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
          title={`Schedule Final Interview - ${selectedApplication.applicant?.firstName} ${selectedApplication.applicant?.lastName}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
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

            {selectedApplication.finalInterviewSchedule && (
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
                    if (selectedApplication?.demoSchedule) {
                      const demoDate = new Date(
                        selectedApplication.demoSchedule,
                      );
                      demoDate.setHours(0, 0, 0, 0);
                      const interviewDt = new Date(
                        `${scheduleDate}T${scheduleTime}:00.000`,
                      );
                      interviewDt.setHours(0, 0, 0, 0);
                      if (interviewDt.getTime() < demoDate.getTime()) {
                        alert(
                          `Interview date must be on or after the demo scheduled on ${formatDate(
                            selectedApplication.demoSchedule,
                          )}`,
                        );
                        return;
                      }
                    }

                    if (selectedApplication?.finalInterviewSchedule) {
                      if (!rescheduleReason) {
                        alert(
                          "Please select a reason for rescheduling the interview.",
                        );
                        return;
                      }
                    }

                    const isoString = `${scheduleDate}T${scheduleTime}:00.000`;
                    await applicationApi.scheduleInterview(
                      selectedApplication.id,
                      isoString,
                      rescheduleReason || undefined,
                      "final",
                    );
                    setShowModal(false);
                    setSelectedApplication(null);
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

export default FinalInterviewScheduling;
