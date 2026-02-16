import React, { useState, useEffect } from "react";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import { applicationApi } from "../../api/applicationApi";
import { preEmploymentApi } from "../../api/preEmploymentApi";
import UploadBox from "../../components/UploadBox"; // Reusing this for read-only display
import { formatDate } from "../../utils/formatDate";

const PreEmploymentRequirements = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
    finalInterviewResult: "PASS",
  });

  // Search state
  const [searchInput, setSearchInput] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [preEmploymentData, setPreEmploymentData] = useState(null);
  const [fetchingRequirements, setFetchingRequirements] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch applications
  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationApi.getAll(filters);
      console.log("=== fetchApplications ===");
      console.log("Response:", response);
      console.log("Applications array:", response.applications);
      if (response.applications && response.applications.length > 0) {
        console.log("First app:", response.applications[0]);
        console.log("First app keys:", Object.keys(response.applications[0]));
        console.log("First app applicant:", response.applications[0].applicant);
        console.log(
          "First app specialization:",
          response.applications[0].specialization,
        );
      }
      setApplications(response.applications);
      setTotalPages(Math.ceil(response.total / filters.limit));
      setTotalCount(response.total);
    } catch (err) {
      setError("Failed to fetch applications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequirements = async (app) => {
    setSelectedApplicant(app);
    setShowModal(true);
    setFetchingRequirements(true);
    setPreEmploymentData(null);

    try {
      // Need an endpoint to get pre-employment by user ID.
      // preEmploymentApi.get() gets for *current user*.
      // HR needs to get for specific user.
      // I might need to add getByUserId to preEmploymentApi and backend.
      // For now, I'll assume there is one or I will add it.
      // Let's assume preEmploymentApi.getByUserId(userId) exists.
      const response = await preEmploymentApi.getByUserId(app.applicantId);
      setPreEmploymentData(response.data);
    } catch (err) {
      // If 404, it just means they haven't uploaded anything yet
      if (
        err.message &&
        (err.message.includes("404") || err.message.includes("not found"))
      ) {
        setPreEmploymentData(null);
      } else {
        console.error("Failed to fetch requirements", err);
      }
    } finally {
      setFetchingRequirements(false);
    }
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    setCurrentPage(page);
  };

  // Reused helpers from PreEmployment.jsx
  const getDownloadUrl = (path) => {
    if (!path) return null;
    // If path is full URL (cloudinary), use it. Assuming backend returns full URLs now.
    return path;
  };

  const handleDownload = (e, url, filename) => {
    e.preventDefault();
    if (!url) return;
    window.open(url, "_blank");
  };

  const TextDetail = ({ label, value }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-900">
        {value || "Not provided"}
      </div>
    </div>
  );

  const columns = [
    {
      header: "Applicant",
      accessor: (row) =>
        `${row.applicant?.firstName || ""} ${row.applicant?.lastName || ""}`,
      cell: (row) => (
        <p className="font-medium text-gray-900">
          {row.applicant?.firstName} {row.applicant?.lastName}
        </p>
      ),
    },
    {
      header: "Email",
      accessor: (row) => row.applicant?.email || "N/A",
      cell: (row) => (
        <p className="text-sm text-gray-700">{row.applicant?.email || "N/A"}</p>
      ),
    },
    {
      header: "Phone",
      accessor: (row) => row.applicant?.phone || "N/A",
      cell: (row) => (
        <p className="text-sm text-gray-700">{row.applicant?.phone || "N/A"}</p>
      ),
    },
    {
      header: "Specialization",
      accessor: (row) => row.specialization?.name || row.program || "N/A",
      cell: (row) => (
        <p className="text-sm text-gray-700">
          {row.specialization?.name || row.program || "N/A"}
        </p>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <Button size="sm" onClick={() => handleViewRequirements(row)}>
          View Requirements
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Pre-Employment Requirements
        </h1>
        <div className="w-64">
          <Input
            placeholder="Search applicants..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={applications}
          isLoading={loading}
          emptyMessage="No applicants found with passed final interviews."
        />
        {applications.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalCount}
            itemsPerPage={filters.limit}
          />
        )}
      </div>

      {/* View Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Pre-Employment Requirements: ${selectedApplicant?.applicant?.firstName} ${selectedApplicant?.applicant?.lastName}`}
        size="full"
      >
        <div className="p-6 max-w-4xl mx-auto">
          {fetchingRequirements ? (
            <div className="text-center py-8">Loading requirements...</div>
          ) : !preEmploymentData ? (
            <div className="text-center py-8 text-gray-500">
              No pre-employment requirements submitted yet.
            </div>
          ) : (
            <div className="space-y-8">
              {/* 1. 2x2 Picture */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">2x2 ID Picture</h3>
                <div className="flex items-start gap-6">
                  {preEmploymentData.photo2x2 ? (
                    <img
                      src={preEmploymentData.photo2x2}
                      alt="2x2 ID"
                      className="w-32 h-32 object-cover rounded border border-gray-300"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-gray-400">
                      No Photo
                    </div>
                  )}
                  <div>
                    {preEmploymentData.photo2x2 ? (
                      <a
                        href={preEmploymentData.photo2x2}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline block"
                      >
                        View Full Size
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* 2. Government IDs */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">
                  Government Identification Numbers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextDetail
                    label="SSS Number"
                    value={preEmploymentData.sss}
                  />
                  <TextDetail
                    label="PhilHealth Number"
                    value={preEmploymentData.philhealth}
                  />
                  <TextDetail label="TIN" value={preEmploymentData.tin} />
                  <TextDetail
                    label="PAG-IBIG / HDMF"
                    value={preEmploymentData.pagibig}
                  />
                </div>
              </div>

              {/* 3. Documents */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Document Uploads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "coe", label: "Certificate of Employment" },
                    { key: "marriageContract", label: "PSA Marriage Contract" },
                    { key: "prcLicense", label: "PRC License" },
                    { key: "civilService", label: "Civil Service Eligibility" },
                    { key: "mastersUnits", label: "Masters Earned Units" },
                    {
                      key: "car",
                      label: "Complete Academic Requirements (CAR)",
                    },
                    {
                      key: "tor",
                      label: "Official Transcripts of Records (TOR)",
                    },
                    { key: "otherCert", label: "Other Certificates" }, // Maps to 'certificates' in frontend logic usually, but checks existing
                  ].map((doc) => (
                    <div key={doc.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {doc.label}
                      </label>
                      {preEmploymentData[doc.key] ? (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm text-green-800 font-medium">
                            Uploaded
                          </span>
                          <a
                            href={preEmploymentData[doc.key]}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto text-sm text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-500 text-sm italic">
                          Not uploaded
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. TESDA Certs */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">
                  TESDA National Certificates
                </h3>
                {(() => {
                  let certs = [];
                  try {
                    if (preEmploymentData.tesdaCerts) {
                      certs = JSON.parse(preEmploymentData.tesdaCerts);
                    }
                  } catch (e) {
                    certs = [];
                  }

                  if (certs && certs.length > 0) {
                    return (
                      <ul className="space-y-2">
                        {certs.map((url, idx) => (
                          <li
                            key={idx}
                            className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded"
                          >
                            <span className="text-sm text-gray-700">
                              Certificate {idx + 1}
                            </span>
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-auto text-sm text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          </li>
                        ))}
                      </ul>
                    );
                  } else {
                    return (
                      <p className="text-gray-500 italic">
                        No TESDA certificates uploaded.
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          )}
          <div className="mt-8 flex justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PreEmploymentRequirements;
