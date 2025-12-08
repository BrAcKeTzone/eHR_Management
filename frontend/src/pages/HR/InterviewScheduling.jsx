import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { formatDate } from "../../utils/formatDate";
import { useApplicationStore } from "../../store/applicationStore";

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

  useEffect(() => {
    getAllApplications({ status: "APPROVED" });
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
    } else {
      (async () => {
        try {
          const res = await getApplicationById(applicationId);
          const appFromApi = res?.application;
          if (appFromApi) {
            setSelectedApplication(appFromApi);
            setShowModal(true);
            setSearchParams({});
          }
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [applications, searchParams, getApplicationById, setSearchParams]);

  const openScheduleModal = (app) => {
    setSelectedApplication(app);
    setShowModal(true);
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
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            onClick={() => openScheduleModal(row)}
            variant={row.interviewSchedule ? "outline" : "primary"}
            size="sm"
          >
            {row.interviewSchedule ? "Reschedule" : "Schedule"}
          </Button>
        </div>
      ),
    },
  ];

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
            <Table columns={columns} data={applications || []} />
          </div>

          <div className="lg:hidden space-y-4">
            {(applications || []).map((app, idx) => (
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
                  >
                    {app.interviewSchedule ? "Reschedule" : "Schedule"}
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
          }}
          title={`Schedule Interview - ${selectedApplication.applicant?.firstName} ${selectedApplication.applicant?.lastName}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Keep a basic form for now - functionality to be implemented */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Interview Date"
                type="date"
                value={""}
                onChange={() => {}}
                min={new Date().toISOString().split("T")[0]}
              />
              <Input
                label="Interview Time"
                type="time"
                value={""}
                onChange={() => {}}
              />
            </div>

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
                onClick={() => {
                  /* TODO: call API to set interview schedule */
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
