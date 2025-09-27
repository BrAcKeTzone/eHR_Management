import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../store/applicationStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import { parseResume } from "../../utils/resumeParser";
import LoadingSpinner from "../../components/LoadingSpinner";

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createApplication, loading, error, clearError } =
    useApplicationStore();

  const [currentStep, setCurrentStep] = useState(0); // Start with step 0 for resume upload
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parseMessage, setParseMessage] = useState("");
  const [hasUploadedResume, setHasUploadedResume] = useState(false);
  const [parseAbortController, setParseAbortController] = useState(null);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    civilStatus: "",
    nationality: "Filipino",

    // Application Details
    program: "",
    position: "",
    teachingExperience: "",
    subjectSpecialization: "",
    educationalBackground: "",
    motivation: "",

    // Documents
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
        phone: user.phoneNumber || "",
        address: user.address || "",
      }));
    }
  }, [user]);

  const [documentPreviews, setDocumentPreviews] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const programs = [
    "Elementary Education",
    "Secondary Education - Mathematics",
    "Secondary Education - Science",
    "Secondary Education - English",
    "Secondary Education - Filipino",
    "Secondary Education - Social Studies",
    "Special Education",
    "Physical Education",
    "Music Education",
    "Art Education",
  ];

  const positions = [
    "Elementary Teacher",
    "Mathematics Teacher",
    "Science Teacher",
    "English Teacher",
    "Filipino Teacher",
    "Social Studies Teacher",
    "Special Education Teacher",
    "Physical Education Teacher",
    "Music Teacher",
    "Art Teacher",
  ];

  const specializations = [
    "Mathematics",
    "Science (Biology/Chemistry/Physics)",
    "English Language Arts",
    "Filipino Language and Literature",
    "Social Studies/History",
    "Physical Education and Health",
    "Music Education",
    "Art Education",
    "Special Education (Learning Disabilities)",
    "Special Education (Autism Spectrum Disorders)",
    "Elementary Education (All Subjects)",
  ];

  const documentTypes = [
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

    // Step 0 (Resume Upload) - no validation required
    if (step === 0) {
      return true;
    }

    if (step === 1) {
      if (!formData.firstName.trim())
        errors.firstName = "First name is required";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required";
      if (!formData.email.trim()) errors.email = "Email is required";
      if (!formData.phone.trim()) errors.phone = "Phone number is required";
      if (!formData.address.trim()) errors.address = "Address is required";
      if (!formData.dateOfBirth)
        errors.dateOfBirth = "Date of birth is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.civilStatus)
        errors.civilStatus = "Civil status is required";
    }

    if (step === 2) {
      if (!formData.program) errors.program = "Program is required";
      if (!formData.position) errors.position = "Position is required";
      if (!formData.subjectSpecialization)
        errors.subjectSpecialization = "Subject specialization is required";
      if (!formData.educationalBackground.trim())
        errors.educationalBackground = "Educational background is required";
      if (!formData.teachingExperience.trim())
        errors.teachingExperience = "Teaching experience is required";
      if (!formData.motivation.trim())
        errors.motivation = "Motivation is required";
    }

    if (step === 3) {
      const requiredDocs = documentTypes.filter((doc) => doc.required);
      const uploadedTypes = documentPreviews.map((doc) => doc.type);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = async (e, documentType) => {
    const files = Array.from(e.target.files);

    const newPreviews = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: documentType,
      file: file,
    }));

    setDocumentPreviews((prev) => [...prev, ...newPreviews]);

    // Update formData documents
    const fileNames = files.map((file) => file.name);
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...fileNames],
    }));

    // Auto-parse resume if it's a resume/CV upload
    if (documentType === "resume" && files.length > 0) {
      const resumeFile = files[0];

      // Check if file type is supported
      const supportedTypes = ["application/pdf", "text/plain"];
      const supportedExtensions = [".pdf", ".txt", ".doc", ".docx"];

      const isSupported =
        supportedTypes.includes(resumeFile.type) ||
        supportedExtensions.some((ext) =>
          resumeFile.name.toLowerCase().endsWith(ext)
        );

      if (isSupported) {
        setIsParsingResume(true);
        setParseMessage("Analyzing your resume...");

        try {
          const parseResult = await parseResume(resumeFile);

          if (parseResult.success && parseResult.data) {
            const { data } = parseResult;

            // Only fill empty fields to avoid overwriting user input
            setFormData((prev) => ({
              ...prev,
              firstName: prev.firstName || data.firstName || "",
              lastName: prev.lastName || data.lastName || "",
              email: prev.email || data.email || "",
              phone: prev.phone || data.phone || "",
              address: prev.address || data.address || "",
              program: prev.program || data.program || "",
              position: prev.position || data.position || "",
              subjectSpecialization:
                prev.subjectSpecialization || data.subjectSpecialization || "",
              educationalBackground:
                prev.educationalBackground || data.educationalBackground || "",
              teachingExperience:
                prev.teachingExperience || data.teachingExperience || "",
            }));

            setParseMessage(
              "✅ Resume parsed successfully! Your information has been auto-filled."
            );

            // Clear success message after 5 seconds
            setTimeout(() => {
              setParseMessage("");
            }, 5000);
          } else {
            setParseMessage(
              "⚠️ " +
                (parseResult.message ||
                  "Could not parse resume automatically. Please fill the form manually.")
            );
            setTimeout(() => {
              setParseMessage("");
            }, 4000);
          }
        } catch (error) {
          console.error("Resume parsing error:", error);
          setParseMessage(
            "⚠️ Error parsing resume. Please fill the form manually."
          );
          setTimeout(() => {
            setParseMessage("");
          }, 4000);
        } finally {
          setIsParsingResume(false);
        }
      } else {
        setParseMessage(
          "⚠️ Resume auto-parsing supports PDF and text files only. Please fill the form manually."
        );
        setTimeout(() => {
          setParseMessage("");
        }, 4000);
      }
    }
  };

  // Manual resume parsing function
  const handleManualParsing = async () => {
    const resumeDoc = documentPreviews.find((doc) => doc.type === "resume");
    if (!resumeDoc) {
      setParseMessage("⚠️ Please upload a resume first before parsing.");
      setTimeout(() => setParseMessage(""), 3000);
      return;
    }

    setIsParsingResume(true);
    setParseMessage("Analyzing your resume...");

    try {
      const parseResult = await parseResume(resumeDoc.file);

      if (parseResult.success && parseResult.data) {
        const { data } = parseResult;

        // Show confirmation dialog for overwriting existing data
        const hasExistingData =
          formData.firstName ||
          formData.lastName ||
          formData.email ||
          formData.phone ||
          formData.address ||
          formData.educationalBackground ||
          formData.teachingExperience;

        if (hasExistingData) {
          const shouldOverwrite = window.confirm(
            "You have existing information in the form. Would you like to overwrite it with the parsed resume data? Click 'OK' to overwrite or 'Cancel' to only fill empty fields."
          );

          if (shouldOverwrite) {
            // Overwrite all fields
            setFormData((prev) => ({
              ...prev,
              firstName: data.firstName || prev.firstName,
              lastName: data.lastName || prev.lastName,
              email: data.email || prev.email,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
              program: data.program || prev.program,
              position: data.position || prev.position,
              subjectSpecialization:
                data.subjectSpecialization || prev.subjectSpecialization,
              educationalBackground:
                data.educationalBackground || prev.educationalBackground,
              teachingExperience:
                data.teachingExperience || prev.teachingExperience,
            }));
          } else {
            // Only fill empty fields
            setFormData((prev) => ({
              ...prev,
              firstName: prev.firstName || data.firstName || "",
              lastName: prev.lastName || data.lastName || "",
              email: prev.email || data.email || "",
              phone: prev.phone || data.phone || "",
              address: prev.address || data.address || "",
              program: prev.program || data.program || "",
              position: prev.position || data.position || "",
              subjectSpecialization:
                prev.subjectSpecialization || data.subjectSpecialization || "",
              educationalBackground:
                prev.educationalBackground || data.educationalBackground || "",
              teachingExperience:
                prev.teachingExperience || data.teachingExperience || "",
            }));
          }
        } else {
          // No existing data, fill everything
          setFormData((prev) => ({
            ...prev,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            program: data.program || "",
            position: data.position || "",
            subjectSpecialization: data.subjectSpecialization || "",
            educationalBackground: data.educationalBackground || "",
            teachingExperience: data.teachingExperience || "",
          }));
        }

        setParseMessage(
          "✅ Resume parsed successfully! Your information has been updated."
        );
        setTimeout(() => setParseMessage(""), 5000);
      } else {
        setParseMessage(
          "⚠️ " +
            (parseResult.message ||
              "Could not parse resume automatically. Please fill the form manually.")
        );
        setTimeout(() => setParseMessage(""), 4000);
      }
    } catch (error) {
      console.error("Manual resume parsing error:", error);
      setParseMessage(
        "⚠️ Error parsing resume. Please check the file format and try again."
      );
      setTimeout(() => setParseMessage(""), 4000);
    } finally {
      setIsParsingResume(false);
    }
  };

  // Handle resume upload in step 0
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file type is supported
    const supportedTypes = ["application/pdf", "text/plain"];
    const supportedExtensions = [".pdf", ".txt", ".doc", ".docx"];

    const isSupported =
      supportedTypes.includes(file.type) ||
      supportedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isSupported) {
      setParseMessage("⚠️ Please upload a PDF, TXT, DOC, or DOCX file.");
      setTimeout(() => setParseMessage(""), 4000);
      return;
    }

    // Add to document previews
    const resumePreview = {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: "resume",
      file: file,
    };

    // Remove any existing resume and add the new one
    setDocumentPreviews((prev) => [
      ...prev.filter((doc) => doc.type !== "resume"),
      resumePreview,
    ]);

    // Update form data
    setFormData((prev) => ({
      ...prev,
      documents: [
        ...prev.documents.filter(
          (doc) =>
            !doc.includes(".pdf") &&
            !doc.includes(".txt") &&
            !doc.includes(".doc")
        ),
        file.name,
      ],
    }));

    setHasUploadedResume(true);

    // Auto-parse the resume
    setIsParsingResume(true);
    setParseMessage("Analyzing your resume...");

    // Create abort controller for this parsing operation
    const controller = new AbortController();
    setParseAbortController(controller);

    try {
      const parseResult = await parseResume(file);

      if (parseResult.success && parseResult.data) {
        const { data } = parseResult;

        // Fill all available fields from resume
        setFormData((prev) => ({
          ...prev,
          firstName: data.firstName || prev.firstName,
          lastName: data.lastName || prev.lastName,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          address: data.address || prev.address,
          program: data.program || prev.program,
          position: data.position || prev.position,
          subjectSpecialization:
            data.subjectSpecialization || prev.subjectSpecialization,
          educationalBackground:
            data.educationalBackground || prev.educationalBackground,
          teachingExperience:
            data.teachingExperience || prev.teachingExperience,
        }));

        setParseMessage(
          "✅ Resume parsed successfully! Your information has been extracted."
        );

        // Auto-advance to next step after successful parsing
        setTimeout(() => {
          setParseMessage("");
          setCurrentStep(1);
        }, 2000);
      } else {
        setParseMessage(
          "⚠️ " +
            (parseResult.message ||
              "Could not parse resume automatically. You can still proceed to fill the form manually.")
        );
        setTimeout(() => {
          setParseMessage("");
        }, 4000);
      }
    } catch (error) {
      console.error("Resume parsing error:", error);
      setParseMessage(
        "⚠️ Error parsing resume. You can still proceed to fill the form manually."
      );
      setTimeout(() => {
        setParseMessage("");
      }, 4000);
    } finally {
      setIsParsingResume(false);
      setParseAbortController(null);
    }
  };

  // Cancel resume parsing
  const cancelParsing = () => {
    if (parseAbortController) {
      parseAbortController.abort();
      setParseAbortController(null);
    }
    setIsParsingResume(false);
    setParseMessage(
      "⚠️ Parsing cancelled. You can try again or continue manually."
    );
    setTimeout(() => {
      setParseMessage("");
    }, 3000);
  };

  // Remove resume document
  const removeResumeDocument = (index) => {
    setDocumentPreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
    setHasUploadedResume(false);
    setParseMessage("");
  };

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
    setDocumentPreviews((prev) => prev.filter((_, i) => i !== index));
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

    if (!validateStep(3)) {
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    try {
      await createApplication(formData);
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
      { number: 1, label: "Personal Info" },
      { number: 2, label: "Application Details" },
      { number: 3, label: "Documents" },
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
                  {step.number === 0 ? "📄" : step.number}
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
          Start by uploading your resume to automatically fill out your
          application form
        </p>
      </div>

      {/* Resume parsing status */}
      {(isParsingResume || parseMessage) && (
        <div
          className={`border rounded-md p-4 ${
            parseMessage.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : parseMessage.includes("⚠️")
              ? "bg-yellow-50 border-yellow-200 text-yellow-700"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isParsingResume && <LoadingSpinner size="sm" />}
              <span className="text-sm font-medium">
                {parseMessage || "Processing resume..."}
              </span>
            </div>
            {isParsingResume && (
              <Button
                type="button"
                onClick={cancelParsing}
                variant="outline"
                className="px-3 py-1 text-xs text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel
              </Button>
            )}
          </div>
          {parseMessage.includes("✅") && (
            <p className="text-xs mt-1">
              Your information has been extracted! Continue to the next step to
              review and modify if needed.
            </p>
          )}
          {isParsingResume && (
            <p className="text-xs mt-1 text-gray-600">
              This may take a few moments depending on your file size. Click
              "Cancel" if it takes too long.
            </p>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-dashed border-blue-300 bg-blue-50/30 rounded-lg p-8 text-center">
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleResumeUpload(e)}
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
              {hasUploadedResume
                ? "📄 Resume uploaded! Click to replace"
                : "🚀 Click to upload your resume"}
            </span>
            <span className="text-sm text-gray-500">
              PDF, DOC, DOCX, TXT files supported
            </span>
            <span className="text-xs text-blue-600 mt-2 font-medium">
              ✨ We'll automatically extract your information
            </span>
          </label>
        </div>

        {/* Show uploaded resume */}
        {documentPreviews
          .filter((doc) => doc.type === "resume")
          .map((doc, index) => (
            <div
              key={index}
              className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4"
            >
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
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">{doc.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={handleManualParsing}
                    disabled={isParsingResume}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isParsingResume ? "Parsing..." : "Re-parse"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => removeResumeDocument(index)}
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
            </div>
          ))}

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Why upload your resume first?
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Automatically fills out your personal information</li>
            <li>• Extracts your educational background and experience</li>
            <li>• Suggests the most suitable teaching programs</li>
            <li>• Saves you time on manual data entry</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            Don't worry - you can review and modify all information in the next
            steps.
          </p>

          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
            <strong>Tip:</strong> If parsing is taking too long, try:
            <br />• Converting your PDF to a text file (.txt)
            <br />• Using a simpler PDF without complex formatting
            <br />• Or click "Cancel" and fill the form manually
          </div>
        </div>

        {!hasUploadedResume && (
          <div className="mt-4 text-center">
            <Button
              type="button"
              onClick={() => setCurrentStep(1)}
              variant="outline"
              className="text-sm"
            >
              Skip resume upload and fill manually
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          error={formErrors.firstName}
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          error={formErrors.lastName}
          required
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={formErrors.email}
          required
          disabled
        />
        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          error={formErrors.phone}
          required
        />
        <Input
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          error={formErrors.dateOfBirth}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.gender ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {formErrors.gender && (
            <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Civil Status <span className="text-red-500">*</span>
          </label>
          <select
            name="civilStatus"
            value={formData.civilStatus}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.civilStatus ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Civil Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
          {formErrors.civilStatus && (
            <p className="mt-1 text-sm text-red-600">
              {formErrors.civilStatus}
            </p>
          )}
        </div>
        <Input
          label="Nationality"
          name="nationality"
          value={formData.nationality}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Complete Address <span className="text-red-500">*</span>
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          rows="3"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formErrors.address ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter your complete address"
        />
        {formErrors.address && (
          <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
        )}
      </div>
    </div>
  );

  const renderApplicationDetails = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Application Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teaching Program <span className="text-red-500">*</span>
          </label>
          <select
            name="program"
            value={formData.program}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.program ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select a program</option>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
          {formErrors.program && (
            <p className="mt-1 text-sm text-red-600">{formErrors.program}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position Applied For <span className="text-red-500">*</span>
          </label>
          <select
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.position ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select a position</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          {formErrors.position && (
            <p className="mt-1 text-sm text-red-600">{formErrors.position}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Specialization <span className="text-red-500">*</span>
          </label>
          <select
            name="subjectSpecialization"
            value={formData.subjectSpecialization}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.subjectSpecialization
                ? "border-red-500"
                : "border-gray-300"
            }`}
          >
            <option value="">Select your specialization</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
          {formErrors.subjectSpecialization && (
            <p className="mt-1 text-sm text-red-600">
              {formErrors.subjectSpecialization}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Educational Background <span className="text-red-500">*</span>
        </label>
        <textarea
          name="educationalBackground"
          value={formData.educationalBackground}
          onChange={handleInputChange}
          rows="4"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formErrors.educationalBackground
              ? "border-red-500"
              : "border-gray-300"
          }`}
          placeholder="List your educational qualifications, degrees, and relevant certifications. Include institution names, graduation years, and any honors received."
        />
        {formErrors.educationalBackground && (
          <p className="mt-1 text-sm text-red-600">
            {formErrors.educationalBackground}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teaching Experience <span className="text-red-500">*</span>
        </label>
        <textarea
          name="teachingExperience"
          value={formData.teachingExperience}
          onChange={handleInputChange}
          rows="4"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formErrors.teachingExperience ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Describe your teaching experience, positions held, institutions, years of service, and relevant achievements. If you're a fresh graduate, describe any practice teaching, tutoring, or related experience."
        />
        {formErrors.teachingExperience && (
          <p className="mt-1 text-sm text-red-600">
            {formErrors.teachingExperience}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Motivation and Goals <span className="text-red-500">*</span>
        </label>
        <textarea
          name="motivation"
          value={formData.motivation}
          onChange={handleInputChange}
          rows="4"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formErrors.motivation ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Explain why you want to become a teacher and your educational goals. What motivates you to teach, and how do you plan to contribute to student learning?"
        />
        {formErrors.motivation && (
          <p className="mt-1 text-sm text-red-600">{formErrors.motivation}</p>
        )}
      </div>
    </div>
  );

  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Document Upload
      </h2>

      {formErrors.documents && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {formErrors.documents}
        </div>
      )}

      {/* Resume parsing status */}
      {(isParsingResume || parseMessage) && (
        <div
          className={`border rounded-md p-4 ${
            parseMessage.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : parseMessage.includes("⚠️")
              ? "bg-yellow-50 border-yellow-200 text-yellow-700"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}
        >
          <div className="flex items-center space-x-2">
            {isParsingResume && <LoadingSpinner size="sm" />}
            <span className="text-sm font-medium">
              {parseMessage || "Processing resume..."}
            </span>
          </div>
          {parseMessage.includes("✅") && (
            <p className="text-xs mt-1">
              You can review and modify the auto-filled information in the
              previous steps.
            </p>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-blue-900">🚀 Smart Resume Parser</h4>
          {documentPreviews.some((doc) => doc.type === "resume") && (
            <Button
              type="button"
              onClick={handleManualParsing}
              disabled={isParsingResume}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isParsingResume ? "Parsing..." : "Parse Resume"}
            </Button>
          )}
        </div>
        <p className="text-sm text-blue-800 mb-3">
          Upload your resume first and we'll automatically fill out your
          personal and professional information!
          {documentPreviews.some((doc) => doc.type === "resume") && (
            <span className="font-medium">
              {" "}
              Or click "Parse Resume" to manually trigger parsing.
            </span>
          )}
        </p>

        <div className="text-xs text-blue-700 mb-3">
          <strong>Supported formats:</strong> PDF, TXT, DOC, DOCX files
        </div>

        <h4 className="font-medium text-blue-900 mb-2">Required Documents:</h4>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          {documentTypes
            .filter((doc) => doc.required)
            .map((doc) => (
              <li key={doc.type}>{doc.label}</li>
            ))}
        </ul>
        <h4 className="font-medium text-blue-900 mb-2 mt-4">
          Optional Documents:
        </h4>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          {documentTypes
            .filter((doc) => !doc.required)
            .map((doc) => (
              <li key={doc.type}>{doc.label}</li>
            ))}
        </ul>
      </div>

      <div className="space-y-4">
        {documentTypes.map((docType) => (
          <div
            key={docType.type}
            className={`border rounded-lg p-4 ${
              docType.type === "resume"
                ? "border-blue-300 bg-blue-50/30"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <span>
                  {docType.label}{" "}
                  {docType.required && <span className="text-red-500">*</span>}
                </span>
                {docType.type === "resume" && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                    ✨ Auto-Parse
                  </span>
                )}
              </label>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  documentPreviews.some((doc) => doc.type === docType.type)
                    ? "bg-green-100 text-green-800"
                    : docType.required
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {documentPreviews.some((doc) => doc.type === docType.type)
                  ? "Uploaded"
                  : docType.required
                  ? "Required"
                  : "Optional"}
              </span>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                docType.type === "resume"
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <input
                type="file"
                id={`doc-${docType.type}`}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, docType.type)}
                className="hidden"
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
                  {docType.type === "resume"
                    ? "🚀 Click to upload resume (auto-fills form)"
                    : `Click to upload ${docType.label.toLowerCase()}`}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {docType.type === "resume"
                    ? "PDF, TXT, DOC, DOCX supported for auto-parsing"
                    : "PDF, DOC, DOCX, JPG, PNG up to 10MB"}
                </span>
              </label>
            </div>

            {/* Show uploaded files for this document type */}
            {documentPreviews
              .filter((doc) => doc.type === docType.type)
              .map((doc, index) => (
                <div
                  key={index}
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
                    onClick={() =>
                      removeDocument(documentPreviews.indexOf(doc))
                    }
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
            Step {currentStep + 1} of 4:{" "}
            {currentStep === 0
              ? "Resume Upload"
              : currentStep === 1
              ? "Personal Information"
              : currentStep === 2
              ? "Application Details"
              : "Document Upload"}
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
            {currentStep === 1 && renderPersonalInfo()}
            {currentStep === 2 && renderApplicationDetails()}
            {currentStep === 3 && renderDocumentUpload()}

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

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    variant="primary"
                    disabled={
                      currentStep === 0 && !hasUploadedResume && isParsingResume
                    }
                  >
                    {currentStep === 0 && !hasUploadedResume
                      ? "Continue Without Resume"
                      : "Next"}
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
              review all information carefully as changes cannot be made after
              submission.
            </p>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                Application Summary:
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Program:</strong> {formData.program}
                </li>
                <li>
                  <strong>Position:</strong> {formData.position}
                </li>
                <li>
                  <strong>Specialization:</strong>{" "}
                  {formData.subjectSpecialization}
                </li>
                <li>
                  <strong>Documents:</strong> {documentPreviews.length} files
                  uploaded
                </li>
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
