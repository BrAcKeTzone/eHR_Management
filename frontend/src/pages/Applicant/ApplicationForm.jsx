import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../store/applicationStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/Button";
import Input from "../../components/Input";

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createApplication, loading, error } = useApplicationStore();

  const [formData, setFormData] = useState({
    program: "",
    teachingExperience: "",
    subjectSpecialization: "",
    educationalBackground: "",
    documents: [],
  });

  // Pre-fill user information
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const [documentPreviews, setDocumentPreviews] = useState([]);

  const programs = [
    "Elementary Education",
    "Secondary Education - Mathematics",
    "Secondary Education - Science",
    "Secondary Education - English",
    "Secondary Education - Social Studies",
    "Special Education",
    "Physical Education",
  ];

  const specializations = [
    "Mathematics",
    "Science (Biology/Chemistry/Physics)",
    "English Language Arts",
    "Social Studies/History",
    "Physical Education",
    "Music",
    "Arts",
    "Computer Science/ICT",
    "Filipino/Literature",
    "Special Education",
  ];

  const requiredDocuments = [
    "Resume/CV",
    "Transcript of Records",
    "Teaching Certificate/License",
    "Government ID",
    "Police Clearance",
    "Medical Certificate",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // For demo purposes, we'll just store file names instead of actual files
    const fileNames = files.map((file) => file.name);

    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...fileNames],
    }));

    // Create previews for new files
    const newPreviews = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
      file: file,
    }));

    setDocumentPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
    setDocumentPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await createApplication(formData);
      alert("Application submitted successfully!");
      navigate("/applicant/dashboard");
    } catch (error) {
      console.error("Failed to submit application:", error);
    }
  };

  const isFormValid = () => {
    return (
      formData.program &&
      formData.teachingExperience &&
      formData.subjectSpecialization &&
      formData.educationalBackground &&
      formData.documents.length > 0
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            New Teaching Application
          </h1>
          <p className="text-gray-600 mt-1">
            Fill out all required information and upload necessary documents
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Program Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teaching Program <span className="text-red-500">*</span>
            </label>
            <select
              name="program"
              value={formData.program}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a program</option>
              {programs.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Specialization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Specialization <span className="text-red-500">*</span>
            </label>
            <select
              name="subjectSpecialization"
              value={formData.subjectSpecialization}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select your specialization</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Applicant Information (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Applicant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <p className="text-gray-900">{user?.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <p className="text-gray-900">{user?.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Educational Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Educational Background <span className="text-red-500">*</span>
            </label>
            <textarea
              name="educationalBackground"
              value={formData.educationalBackground}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="List your educational qualifications, degrees, and relevant certifications. Include institution names, graduation years, and any honors received."
              required
            />
          </div>

          {/* Teaching Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teaching Experience <span className="text-red-500">*</span>
            </label>
            <textarea
              name="teachingExperience"
              value={formData.teachingExperience}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your teaching experience, positions held, institutions, years of service, and relevant achievements. If you're a fresh graduate, describe any practice teaching, tutoring, or related experience."
              required
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Documents <span className="text-red-500">*</span>
            </label>
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Required Documents:
                </h4>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  {requiredDocuments.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="documents"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="documents"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg
                  className="w-12 h-12 text-gray-400 mb-2"
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
                  Click to upload files or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX, JPG, PNG up to 10MB each
                </span>
              </label>
            </div>

            {/* Document Previews */}
            {documentPreviews.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-gray-700">
                  Uploaded Documents:
                </h4>
                {documentPreviews.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
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
                      onClick={() => removeDocument(index)}
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
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={() => navigate("/applicant/dashboard")}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !isFormValid()}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
