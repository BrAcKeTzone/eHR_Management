import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../store/applicationStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createApplication, loading, error } = useApplicationStore();

  const [currentStep, setCurrentStep] = useState(0); // 0: Resume, 1: Application Letter, 2: Documents
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // File upload states
  const [resumeFile, setResumeFile] = useState(null);
  const [applicationLetterFile, setApplicationLetterFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);

  const [formErrors, setFormErrors] = useState({});

  const requiredDocuments = [
    { type: "diploma", label: "Diploma/Degree Certificate", required: true },
    {
      type: "transcript",
      label: "Official Transcript of Records",
      required: true,
    },
    {
      type: "license",
      label: "Teaching License (if available)",
      required: false,
    },
    { type: "certificates", label: "Training Certificates", required: false },
    {
      type: "recommendations",
      label: "Letters of Recommendation",
      required: false,
    },
    { type: "id", label: "Government ID", required: true },
    { type: "medical", label: "Medical Certificate", required: false },
  ];

  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!resumeFile) {
        errors.resume = "Please upload your resume";
      }
    }

    if (step === 1) {
      if (!applicationLetterFile) {
        errors.applicationLetter = "Please upload your application letter";
      }
    }

    if (step === 2) {
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
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle resume upload
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(2)) {
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

      const applicationData = {
        documents: allDocuments,
        applicantId: user?.id,
        program: "Teaching Application", // You can make this configurable
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

  const renderStepIndicator = () => {
    const steps = [
      { number: 0, label: "Resume Upload" },
      { number: 1, label: "Application Letter" },
      { number: 2, label: "Documents" },
    ];

    return (
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        <div className="flex items-center space-x-2 min-w-max">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.number <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.number + 1}
                </div>
                <span className="text-xs mt-1 text-center text-gray-600 max-w-20">
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step.number < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

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
            accept=".pdf,.doc,.docx,.txt"
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
              PDF, DOC, DOCX, TXT files supported
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
            accept=".pdf,.doc,.docx,.txt"
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
              PDF, DOC, DOCX, TXT files supported
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
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
                  PDF, DOC, DOCX, JPG, PNG up to 10MB
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            New Teaching Application
          </h1>
          <p className="text-gray-600 mt-1">
            Step {currentStep + 1} of 3:{" "}
            {currentStep === 0
              ? "Resume Upload"
              : currentStep === 1
              ? "Application Letter Upload"
              : "Required Documents"}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="p-6">
          {renderStepIndicator()}

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 0 && renderResumeUpload()}
            {currentStep === 1 && renderApplicationLetter()}
            {currentStep === 2 && renderDocuments()}

            {/* Form Actions */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <div>
                {currentStep > 0 && (
                  <Button type="button" onClick={prevStep} variant="outline">
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  onClick={() => navigate("/applicant/dashboard")}
                  variant="outline"
                >
                  Cancel
                </Button>

                {currentStep < 2 ? (
                  <Button type="button" onClick={nextStep} variant="primary">
                    Next
                  </Button>
                ) : (
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

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
