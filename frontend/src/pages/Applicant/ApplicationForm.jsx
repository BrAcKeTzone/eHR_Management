import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../store/applicationStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createApplication, loading, error, getCurrentApplication } =
    useApplicationStore();

  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [pendingApplicationData, setPendingApplicationData] = useState(null);
  const [isCheckingPending, setIsCheckingPending] = useState(true);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // File upload states
  const [resumeFile, setResumeFile] = useState(null);
  const [applicationLetterFile, setApplicationLetterFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);

  const [formErrors, setFormErrors] = useState({});

  // Check for pending application on component mount
  useEffect(() => {
    const checkPendingApplication = async () => {
      try {
        setIsCheckingPending(true);
        const result = await getCurrentApplication();

        if (result.application) {
          const applicationStatus = result.application.status?.toUpperCase();
          // Check if application is PENDING or APPROVED
          if (
            applicationStatus === "PENDING" ||
            applicationStatus === "APPROVED"
          ) {
            setHasPendingApplication(true);
            setPendingApplicationData(result.application);
          }
        }
      } catch (err) {
        console.error("Error checking pending application:", err);
      } finally {
        setIsCheckingPending(false);
      }
    };

    checkPendingApplication();
  }, [getCurrentApplication]);

  const requiredDocuments = [
    { type: "diploma", label: "Diploma / Degree Certificate", required: true },
    {
      type: "transcript",
      label: "Transcript of Records (TOR)",
      required: false,
    },
    { type: "pds", label: "Personal Data Sheet (PDS)", required: true },
    { type: "prc", label: "PRC License", required: true },
    { type: "certificates", label: "Training Certificates", required: false },
  ];

  const validateAll = () => {
    const errors = {};

    if (!resumeFile) {
      errors.resume = "Please upload your resume";
    }

    if (!applicationLetterFile) {
      errors.applicationLetter = "Please upload your application letter";
    }

    const requiredDocs = requiredDocuments.filter((doc) => doc.required);
    const uploadedTypes = documentFiles.map((doc) => doc.type);
    const missingRequired = requiredDocs.filter(
      (doc) => !uploadedTypes.includes(doc.type)
    );

    if (missingRequired.length > 0) {
      errors.documents = `Missing required documents: ${missingRequired
        .map((doc) => doc.label)
        .join(", ")}`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];

  // Handle resume upload
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!ALLOWED_MIME.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          resume: "Invalid file type. Only PDF, JPG, PNG are allowed.",
        }));
        return;
      }
      setResumeFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        file: file,
      });
      setUploadStatus("Resume uploaded successfully!");
      setTimeout(() => setUploadStatus(""), 3000);

      // Clear error
      if (formErrors.resume) {
        setFormErrors((prev) => ({ ...prev, resume: "" }));
      }
    }
  };

  // Handle application letter upload
  const handleApplicationLetterUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!ALLOWED_MIME.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          applicationLetter:
            "Invalid file type. Only PDF, JPG, PNG are allowed.",
        }));
        return;
      }
      setApplicationLetterFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        file: file,
      });
      setUploadStatus("Application letter uploaded successfully!");
      setTimeout(() => setUploadStatus(""), 3000);

      // Clear error
      if (formErrors.applicationLetter) {
        setFormErrors((prev) => ({ ...prev, applicationLetter: "" }));
      }
    }
  };

  // Handle document upload
  const handleDocumentUpload = (e, documentType) => {
    const files = Array.from(e.target.files);

    // Validate files - only allow PDF/JPG/PNG
    const invalidFiles = files.filter((f) => !ALLOWED_MIME.includes(f.type));
    if (invalidFiles.length > 0) {
      setFormErrors((prev) => ({
        ...prev,
        documents:
          "Some files have invalid types. Only PDF, JPG, PNG are allowed.",
      }));
      return;
    }

    const newDocuments = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: documentType,
      file: file,
    }));

    setDocumentFiles((prev) => [...prev, ...newDocuments]);
    setUploadStatus(`${files.length} document(s) uploaded successfully!`);
    setTimeout(() => setUploadStatus(""), 3000);

    // Clear error
    if (formErrors.documents) {
      setFormErrors((prev) => ({ ...prev, documents: "" }));
    }
  };

  // Remove uploaded file
  const removeFile = (fileType, index = null) => {
    if (fileType === "resume") {
      setResumeFile(null);
    } else if (fileType === "applicationLetter") {
      setApplicationLetterFile(null);
    } else if (fileType === "documents" && index !== null) {
      setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Next/Prev were used for multi-step flow; replaced with single-page flow

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    try {
      // Prepare all files for upload
      const allDocuments = [];

      // Add resume
      if (resumeFile) {
        allDocuments.push({ ...resumeFile, type: "resume" });
      }

      // Add application letter
      if (applicationLetterFile) {
        allDocuments.push({
          ...applicationLetterFile,
          type: "applicationLetter",
        });
      }

      // Add other documents
      allDocuments.push(...documentFiles);

      console.log("Submitting application with files:", {
        totalFiles: allDocuments.length,
        fileDetails: allDocuments.map((doc) => ({
          name: doc.name,
          type: doc.type,
          hasFile: !!doc.file,
        })),
      });

      const applicationData = {
        documents: allDocuments,
        applicantId: user?.id,
      };

      await createApplication(applicationData);
      setShowConfirmModal(false);
      navigate("/applicant/dashboard", {
        state: { message: "Application submitted successfully!" },
      });
    } catch (error) {
      console.error("Failed to submit application:", error);
      setShowConfirmModal(false);
    }
  };

  // Step indicator removed for single-page layout

  const renderResumeUpload = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Upload Your Resume
        </h2>
        <p className="text-gray-600">
          Please upload your complete resume or CV
        </p>
      </div>

      {/* Upload status */}
      {uploadStatus && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <span className="text-sm font-medium">{uploadStatus}</span>
        </div>
      )}

      {/* Error display */}
      {formErrors.resume && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <span className="text-sm">{formErrors.resume}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-dashed border-blue-300 bg-blue-50/30 rounded-lg p-8 text-center">
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleResumeUpload}
            className="hidden"
          />
          <label
            htmlFor="resume-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-lg text-gray-700 font-medium mb-2">
              {resumeFile
                ? "📄 Resume uploaded! Click to replace"
                : "📄 Click to upload resume"}
            </span>
            <span className="text-sm text-gray-500">
              Only PDF, JPG, PNG files supported (max 10MB)
            </span>
          </label>
        </div>

        {/* Show uploaded resume */}
        {resumeFile && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {resumeFile.name}
                  </p>
                  <p className="text-xs text-gray-500">{resumeFile.size}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile("resume")}
                className="text-red-500 hover:text-red-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderApplicationLetter = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Upload Application Letter
        </h2>
        <p className="text-gray-600">
          Please upload your application letter or cover letter
        </p>
      </div>

      {/* Upload status */}
      {uploadStatus && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <span className="text-sm font-medium">{uploadStatus}</span>
        </div>
      )}

      {/* Error display */}
      {formErrors.applicationLetter && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <span className="text-sm">{formErrors.applicationLetter}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-dashed border-green-300 bg-green-50/30 rounded-lg p-8 text-center">
          <input
            type="file"
            id="application-letter-upload"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleApplicationLetterUpload}
            className="hidden"
          />
          <label
            htmlFor="application-letter-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
            <span className="text-lg text-gray-700 font-medium mb-2">
              {applicationLetterFile
                ? "✉️ Application letter uploaded! Click to replace"
                : "✉️ Click to upload application letter"}
            </span>
            <span className="text-sm text-gray-500">
              Only PDF, JPG, PNG files supported (max 10MB)
            </span>
          </label>
        </div>

        {/* Show uploaded application letter */}
        {applicationLetterFile && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {applicationLetterFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {applicationLetterFile.size}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile("applicationLetter")}
                className="text-red-500 hover:text-red-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Upload Required Documents
        </h2>
        <p className="text-gray-600">
          Please upload all required documents for your application
        </p>
      </div>

      {/* Upload status */}
      {uploadStatus && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <span className="text-sm font-medium">{uploadStatus}</span>
        </div>
      )}

      {/* Error display */}
      {formErrors.documents && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <span className="text-sm">{formErrors.documents}</span>
        </div>
      )}

      <div className="space-y-4">
        {requiredDocuments.map((docType) => (
          <div
            key={docType.type}
            className="border rounded-lg p-4 border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <span>
                  {docType.label}{" "}
                  {docType.required && <span className="text-red-500">*</span>}
                </span>
              </label>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  documentFiles.some((doc) => doc.type === docType.type)
                    ? "bg-green-100 text-green-800"
                    : docType.required
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {documentFiles.some((doc) => doc.type === docType.type)
                  ? "Uploaded"
                  : docType.required
                  ? "Required"
                  : "Optional"}
              </span>
            </div>

            <div className="border-2 border-dashed rounded-lg p-4 text-center border-gray-300">
              <input
                type="file"
                id={`doc-${docType.type}`}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleDocumentUpload(e, docType.type)}
                className="hidden"
                multiple
              />
              <label
                htmlFor={`doc-${docType.type}`}
                className="cursor-pointer flex flex-col items-center"
              >
                <svg
                  className="w-8 h-8 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  Click to upload {docType.label.toLowerCase()}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG up to 10MB
                </span>
              </label>
            </div>

            {/* Show uploaded files for this document type */}
            {documentFiles
              .filter((doc) => doc.type === docType.type)
              .map((doc, index) => {
                const globalIndex = documentFiles.indexOf(doc);
                return (
                  <div
                    key={globalIndex}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md mt-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500">{doc.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile("documents", globalIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Loading pending application check */}
      {isCheckingPending && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Checking for pending applications...
            </p>
          </div>
        </div>
      )}

      {/* Pending Application Alert */}
      {!isCheckingPending && hasPendingApplication && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
              <svg
                className="h-8 w-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4v2m0 4v2m-6-9h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              You Have a Pending Application
            </h2>

            <p className="text-gray-600 mb-4">
              You already have an active application that is currently being
              reviewed. You cannot file a new application until your current
              application is completed or rejected.
            </p>

            {pendingApplicationData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-blue-900 mb-2">
                  Current Application Details:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    <strong>Status:</strong> {pendingApplicationData.status}
                  </li>
                  <li>
                    <strong>Submitted:</strong>{" "}
                    {new Date(
                      pendingApplicationData.createdAt
                    ).toLocaleDateString()}
                  </li>
                  <li>
                    <strong>Attempt:</strong> #
                    {pendingApplicationData.attemptNumber}
                  </li>
                </ul>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              Please check your email for updates on your application status or
              contact the HR department for more information.
            </p>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/applicant/dashboard")}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate("/applicant/history")}
              >
                View Application History
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Normal Application Form (only show if no pending application) */}
      {!isCheckingPending && !hasPendingApplication && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              New Teaching Application
            </h1>
            <p className="text-gray-600 mt-1">
              Please complete the sections below and submit your application
              when you're finished.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderResumeUpload()}
              {renderApplicationLetter()}
              {renderDocuments()}

              {/* Form Actions */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <div />

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    onClick={() => navigate("/applicant/dashboard")}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Application Submission"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to submit your teaching application? Please
              review all uploaded files carefully as changes cannot be made
              after submission.
            </p>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                Files to be submitted:
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {resumeFile && <li>✅ Resume: {resumeFile.name}</li>}
                {applicationLetterFile && (
                  <li>✅ Application Letter: {applicationLetterFile.name}</li>
                )}
                <li>✅ Documents: {documentFiles.length} files uploaded</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmSubmit}
                variant="primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApplicationForm;
