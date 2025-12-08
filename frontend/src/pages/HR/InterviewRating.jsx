import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { formatDate } from "../../utils/formatDate";
import { useApplicationStore } from "../../store/applicationStore";

const InterviewRating = () => {
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
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");

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

  const openRatingModal = (app) => {
    setSelectedApplication(app);
    setScore(app.interviewScore ?? "");
    setNotes(app.interviewNotes ?? "");
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
      header: "Interview",
      accessor: "interviewSchedule",
      cell: (row) => (
        <div className="text-sm">
          {row.interviewSchedule ? (
            <div>
              <p className="font-medium text-green-600">Scheduled</p>
              <p className="text-gray-600">
                {formatDate(row.interviewSchedule)}
              </p>
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
            onClick={() => openRatingModal(row)}
            disabled={!row.interviewSchedule}
            size="sm"
          >
            {row.interviewScore ? "Edit Rating" : "Rate Interview"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Interview Rating
        </h1>
        <p className="text-gray-600">Record ratings/feedback for interviews.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <DashboardCard title="Interviews">
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
                    <span className="text-gray-500">Interview:</span>
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
                    onClick={() => openRatingModal(app)}
                    size="sm"
                    className="flex-1"
                    disabled={!app.interviewSchedule}
                  >
                    {app.interviewScore ? "Edit Rating" : "Rate Interview"}
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
          title={`Interview Rating - ${selectedApplication.applicant?.firstName} ${selectedApplication.applicant?.lastName}`}
          size="large"
        >
          <div className="space-y-4 sm:space-y-6">
            <Input
              label="Score (0-100)"
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
            <Input
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

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
                  /* TODO: call API to save interview rating */
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

export default InterviewRating;
