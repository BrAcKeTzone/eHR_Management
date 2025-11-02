import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../store/applicationStore";
import { useScheduleStore } from "../../store/scheduleStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { formatDate } from "../../utils/formatDate";
import { APPLICATION_STATUS } from "../../utils/constants";

const Scheduling = () => {
  const {
    applications,
    getAllApplications,
    loading: appLoading,
    error: appError,
  } = useApplicationStore();

  const {
    setDemoSchedule,
    updateDemoSchedule,
    getAvailableSlots,
    loading: scheduleLoading,
    error: scheduleError,
  } = useScheduleStore();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: "",
    time: "",
    location: "",
    duration: "60",
    notes: "",
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Calculate minimum date (tomorrow)
  const getMinimumDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  useEffect(() => {
    // Load approved applications that need scheduling
    getAllApplications({ status: APPLICATION_STATUS.APPROVED });
  }, [getAllApplications]);

  useEffect(() => {
    if (selectedDate) {
      getAvailableSlots(selectedDate).then(setAvailableSlots);
    }
  }, [selectedDate, getAvailableSlots]);

  const approvedApplications =
    applications?.filter((app) => app.status === APPLICATION_STATUS.APPROVED) ||
    [];

  const handleScheduleDemo = (application) => {
    setSelectedApplication(application);
    setShowScheduleModal(true);
    // Reset schedule data
    setScheduleData({
      date: "",
      time: "",
      location: "",
      duration: "60",
      notes: "",
    });
  };

  const handleSubmitSchedule = async () => {
    if (!selectedApplication || !scheduleData.date || !scheduleData.time)
      return;

    // Validate demo date is at least 1 day in the future
    const selectedDateObj = new Date(scheduleData.date);
    const minimumDate = new Date(getMinimumDate());

    if (selectedDateObj < minimumDate) {
      alert(
        `Demo date must be at least 1 day in the future. Please select a date starting from ${getMinimumDate()}`
      );
      return;
    }

    try {
      if (selectedApplication.demoSchedule) {
        await updateDemoSchedule(selectedApplication.id, scheduleData);
      } else {
        await setDemoSchedule(selectedApplication.id, scheduleData);
      }

      setShowScheduleModal(false);
      setSelectedApplication(null);
      // Refresh applications
      getAllApplications({ status: APPLICATION_STATUS.APPROVED });
    } catch (error) {
      console.error("Failed to schedule demo:", error);
    }
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const isSlotAvailable = (time) => {
    return !availableSlots.includes(time);
  };

  const applicationsColumns = [
    {
      header: "Applicant",
      accessor: "applicant",
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
      header: "Approved Date",
      accessor: "updatedAt",
      cell: (row) => (
        <div className="text-sm text-gray-600">{formatDate(row.updatedAt)}</div>
      ),
    },
    {
      header: "Demo Schedule",
      accessor: "demoSchedule",
      cell: (row) => (
        <div className="text-sm">
          {row.demoSchedule ? (
            <div>
              <p className="font-medium text-green-600">Scheduled</p>
              <p className="text-gray-600">{formatDate(row.demoSchedule)}</p>
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
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            onClick={() => handleScheduleDemo(row)}
            variant={row.demoSchedule ? "outline" : "primary"}
            size="sm"
          >
            {row.demoSchedule ? "Reschedule" : "Schedule"}
          </Button>
        </div>
      ),
    },
  ];

  const loading = appLoading || scheduleLoading;
  const error = appError || scheduleError;

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
          Demo Scheduling
        </h1>
        <p className="text-gray-600">
          Schedule teaching demonstrations for approved applicants.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <DashboardCard title="Total Approved" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {approvedApplications.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Applications</div>
        </DashboardCard>

        <DashboardCard title="Scheduled" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">
            {approvedApplications.filter((app) => app.demoSchedule).length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Demos</div>
        </DashboardCard>

        <DashboardCard title="Pending Schedule" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
            {approvedApplications.filter((app) => !app.demoSchedule).length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Need scheduling</div>
        </DashboardCard>
      </div>

      {/* Applications Table */}
      <DashboardCard title="Approved Applications">
        {approvedApplications.length > 0 ? (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table
                columns={applicationsColumns}
                data={approvedApplications}
              />
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {approvedApplications.map((app, index) => (
                <div
                  key={index}
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
                      <span className="text-gray-500">Approved:</span>
                      <p className="font-medium">{formatDate(app.updatedAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Demo Schedule:</span>
                      {app.demoSchedule ? (
                        <div className="mt-1">
                          <p className="font-medium text-green-600">
                            Scheduled
                          </p>
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
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleScheduleDemo(app)}
                      variant={app.demoSchedule ? "outline" : "primary"}
                      size="sm"
                      className="flex-1"
                    >
                      {app.demoSchedule ? "Reschedule" : "Schedule"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No approved applications found.</p>
          </div>
        )}
      </DashboardCard>

      {/* Schedule Modal */}
      {showScheduleModal && selectedApplication && (
        <Modal
          isOpen={true}
          onClose={() => setShowScheduleModal(false)}
          title={`Schedule Demo - ${selectedApplication.applicant?.firstName} ${selectedApplication.applicant?.lastName}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Application Info */}
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

            {/* Schedule Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Demo Date"
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => {
                    setScheduleData({ ...scheduleData, date: e.target.value });
                    setSelectedDate(e.target.value);
                  }}
                  required
                  min={getMinimumDate()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demo Time <span className="text-red-500">*</span>
                </label>
                <select
                  value={scheduleData.time}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a time</option>
                  {getTimeSlots().map((time) => (
                    <option
                      key={time}
                      value={time}
                      disabled={!isSlotAvailable(time)}
                    >
                      {time} {!isSlotAvailable(time) && "(Unavailable)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location"
                value={scheduleData.location}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, location: e.target.value })
                }
                placeholder="Room number or location"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={scheduleData.duration}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      duration: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={scheduleData.notes}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, notes: e.target.value })
                }
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional instructions or notes for the applicant..."
              />
            </div>

            {/* Current Schedule Info */}
            {selectedApplication.demoSchedule && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Current Schedule
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p className="break-words">
                    Date: {formatDate(selectedApplication.demoSchedule)}
                  </p>
                  {selectedApplication.demoTime && (
                    <p className="break-words">
                      Time: {selectedApplication.demoTime}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowScheduleModal(false)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSchedule}
                variant="primary"
                disabled={
                  !scheduleData.date || !scheduleData.time || scheduleLoading
                }
                className="w-full sm:w-auto"
              >
                {scheduleLoading
                  ? "Saving..."
                  : selectedApplication.demoSchedule
                  ? "Update Schedule"
                  : "Schedule Demo"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Scheduling;
