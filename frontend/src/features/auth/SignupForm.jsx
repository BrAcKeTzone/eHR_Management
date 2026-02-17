import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Input from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import OTPInput from "../../components/OTPInput";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import privacyPolicyData from "../../data/privacyPolicy.json";
import userApi from "../../api/userApi";

const SignupForm = () => {
  const navigate = useNavigate();
  const {
    signupPhase,
    signupData,
    generatedOtp,
    sendOtp,
    verifyOtp,
    completeRegistration,
    resetSignup,
    loading,
    error,
    clearError,
  } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    civilStatus: "Single",
    houseNo: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    zipCode: "",
    education: [{ school: "", course: "", yearGraduated: "" }],
    references: [
      { name: "", contactNo: "", relationship: "" },
      { name: "", contactNo: "", relationship: "" },
      { name: "", contactNo: "", relationship: "" },
    ],
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [agreedToPrivacyPolicy, setAgreedToPrivacyPolicy] = useState(false);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);

  // Reset signup process when component mounts
  useEffect(() => {
    resetSignup();
  }, [resetSignup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (error) clearError();
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, education: updated }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { school: "", course: "", yearGraduated: "" },
      ],
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      const updated = formData.education.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, education: updated }));
    }
  };

  const handleReferenceChange = (index, field, value) => {
    const updated = [...formData.references];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, references: updated }));
  };

  const validateEmail = async () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    } else {
      // Check if email already exists
      try {
        const response = await userApi.checkEmailExists(formData.email);
        if (response.data?.exists) {
          errors.email = "This email is already registered";
        }
      } catch (err) {
        console.error("Error checking email:", err);
        // Continue with signup even if email check fails
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOtp = () => {
    const errors = {};
    if (!formData.otp.trim()) {
      errors.otp = "OTP is required";
    } else if (formData.otp.length !== 6) {
      errors.otp = "OTP must be 6 digits";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePersonalDetails = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.civilStatus) errors.civilStatus = "Civil status is required";
    // House No, Street, Barangay are now optional
    if (!formData.city) errors.city = "City/Municipality is required";
    if (!formData.province) errors.province = "Province is required";
    if (!formData.zipCode) errors.zipCode = "Zip Code is required";

    if (
      formData.education.some(
        (edu) => !edu.school || !edu.course || !edu.yearGraduated,
      )
    ) {
      errors.education = "Please fill in all education fields";
    }

    if (
      formData.references.some(
        (ref) => !ref.name || !ref.contactNo || !ref.relationship,
      )
    ) {
      errors.references = "Please fill in all reference fields";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhase1Submit = async (e) => {
    e.preventDefault();
    if (!(await validateEmail())) return;

    try {
      const result = await sendOtp(formData.email);
      // OTP will be sent to the user's email
      console.log("OTP sent successfully");
    } catch (err) {
      console.error("Failed to send OTP:", err);
    }
  };

  const handlePhase2Submit = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    try {
      await verifyOtp(formData.otp);
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  const handlePhase3Submit = async (e) => {
    e.preventDefault();
    if (!validatePersonalDetails()) return;

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        password: formData.password,
        civilStatus: formData.civilStatus,
        city: formData.city,
        province: formData.province,
        zipCode: formData.zipCode,
        education: formData.education,
        references: formData.references,
      };

      // Only add optional fields if they have values
      if (formData.houseNo.trim()) registrationData.houseNo = formData.houseNo;
      if (formData.street.trim()) registrationData.street = formData.street;
      if (formData.barangay.trim())
        registrationData.barangay = formData.barangay;

      await completeRegistration(registrationData);
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const handleStartOver = () => {
    resetSignup();
    setFormData({
      email: "",
      otp: "",
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      confirmPassword: "",
      civilStatus: "Single",
      houseNo: "",
      street: "",
      barangay: "",
      city: "",
      province: "",
      zipCode: "",
      education: [{ school: "", course: "", yearGraduated: "" }],
      references: [
        { name: "", contactNo: "", relationship: "" },
        { name: "", contactNo: "", relationship: "" },
        { name: "", contactNo: "", relationship: "" },
      ],
    });
    setValidationErrors({});
    setAgreedToPrivacyPolicy(false);
  };

  const renderPhase1 = () => (
    <form onSubmit={handlePhase1Submit} className="mt-8 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Step 1 of 3: Enter your email
        </h3>
        <Input
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email address"
        />
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={loading}
      >
        {loading ? <LoadingSpinner size="sm" /> : "Send OTP"}
      </Button>
    </form>
  );

  const renderPhase2 = () => (
    <form onSubmit={handlePhase2Submit} className="mt-8 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Step 2 of 3: Verify your email
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We've sent a 6-digit code to <strong>{signupData.email}</strong>.
          Please check your email and enter the code below.
        </p>
        <OTPInput
          label="Enter OTP"
          value={formData.otp}
          onChange={(otp) =>
            setFormData({
              ...formData,
              otp: otp,
            })
          }
          length={6}
        />
        {validationErrors.otp && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.otp}</p>
        )}
      </div>

      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleStartOver}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : "Verify OTP"}
        </Button>
      </div>
    </form>
  );

  const renderPhase3 = () => (
    <form onSubmit={handlePhase3Submit} className="mt-8 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Step 3 of 3: Complete your profile
        </h3>

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="First Name"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Last Name"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.lastName}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="09123456789"
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Civil Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="civilStatus"
                  value={formData.civilStatus}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                  <option value="Divorced">Divorced</option>
                </select>
                {validationErrors.civilStatus && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.civilStatus}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Residential Address */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              Residential Address
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="House No. (Optional)"
                name="houseNo"
                value={formData.houseNo}
                onChange={handleChange}
              />
              <Input
                label="Street (Optional)"
                name="street"
                value={formData.street}
                onChange={handleChange}
              />
              <Input
                label="Barangay (Optional)"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
              />
              <Input
                label="City/Municipality"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <Input
                label="Province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
              />
              <Input
                label="Zip Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
              />
            </div>
            {(validationErrors.city ||
              validationErrors.province ||
              validationErrors.zipCode) && (
              <p className="mt-1 text-sm text-red-600">
                Please complete the required address fields.
              </p>
            )}
          </div>

          {/* Educational Background */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-semibold text-gray-700">
                Educational Background
              </h4>
              <button
                type="button"
                onClick={addEducation}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Education
              </button>
            </div>
            {formData.education.map((edu, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded mb-3 relative border border-gray-200"
              >
                {formData.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Remove
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <Input
                    label="School"
                    value={edu.school}
                    onChange={(e) =>
                      handleEducationChange(index, "school", e.target.value)
                    }
                    required
                    placeholder="School Name"
                  />
                  <Input
                    label="Course/Strand"
                    value={edu.course}
                    onChange={(e) =>
                      handleEducationChange(index, "course", e.target.value)
                    }
                    required
                    placeholder="BSIT"
                  />
                  <Input
                    label="Year Graduated"
                    value={edu.yearGraduated}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "yearGraduated",
                        e.target.value,
                      )
                    }
                    required
                    placeholder="2020"
                  />
                </div>
              </div>
            ))}
            {validationErrors.education && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.education}
              </p>
            )}
          </div>

          {/* References */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              Character References (3)
            </h4>
            {formData.references.map((ref, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded mb-3 border border-gray-200"
              >
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  Reference #{index + 1}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    label="Name"
                    value={ref.name}
                    onChange={(e) =>
                      handleReferenceChange(index, "name", e.target.value)
                    }
                    required
                    placeholder="Full Name"
                  />
                  <Input
                    label="Contact No."
                    value={ref.contactNo}
                    onChange={(e) =>
                      handleReferenceChange(index, "contactNo", e.target.value)
                    }
                    required
                    placeholder="09xxxxxxxxx"
                  />
                  <Input
                    label="Relationship"
                    value={ref.relationship}
                    onChange={(e) =>
                      handleReferenceChange(
                        index,
                        "relationship",
                        e.target.value,
                      )
                    }
                    required
                    placeholder="Colleague"
                  />
                </div>
              </div>
            ))}
            {validationErrors.references && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.references}
              </p>
            )}
          </div>

          {/* Account Security */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              Account Security
            </h4>
            <div className="space-y-4">
              <div>
                <PasswordInput
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 characters"
                  error={validationErrors.password}
                />
              </div>

              <div>
                <PasswordInput
                  label="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter your password"
                  error={validationErrors.confirmPassword}
                />
              </div>
            </div>
          </div>

          {/* Privacy Policy Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="privacy-policy"
                name="privacy-policy"
                type="checkbox"
                checked={agreedToPrivacyPolicy}
                onChange={(e) => setAgreedToPrivacyPolicy(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="privacy-policy" className="text-gray-700">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowPrivacyPolicyModal(true)}
                  className="text-blue-600 hover:text-blue-500 font-medium underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleStartOver}
        >
          Start Over
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={loading || !agreedToPrivacyPolicy}
        >
          {loading ? <LoadingSpinner size="sm" /> : "Create Account"}
        </Button>
      </div>
    </form>
  );

  const renderPhase4 = () => (
    <div className="mt-8 text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Congratulations!
        </h3>
        <p className="text-gray-600 mb-1">
          Your account has been created successfully.
        </p>
        <p className="text-sm text-gray-500">
          Welcome to BCFI HR Application System, {signupData.firstName}{" "}
          {signupData.lastName}!
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => navigate("/signin")}
        >
          Sign In Now
        </Button>

        <Button variant="outline" className="w-full" onClick={handleStartOver}>
          Create Another Account
        </Button>
      </div>
    </div>
  );

  const renderPrivacyPolicyModal = () => {
    if (!showPrivacyPolicyModal) return null;

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {privacyPolicyData.title}
            </h2>
            <button
              onClick={() => setShowPrivacyPolicyModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 mb-4">
                <strong>Effective Date:</strong>{" "}
                {privacyPolicyData.effectiveDate}
              </p>

              {privacyPolicyData.sections.map((section) => (
                <div key={section.number}>
                  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                    {section.number}. {section.title}
                  </h3>
                  <p className="text-gray-700 mb-2">{section.content}</p>

                  {/* Render items list if they exist */}
                  {section.items && (
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                      {section.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {/* Render contact info if it exists */}
                  {section.contactInfo && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <p className="text-gray-700">
                        <strong>{section.contactInfo.organization}</strong>
                        <br />
                        {section.contactInfo.department}
                        <br />
                        Email: {section.contactInfo.email}
                        <br />
                        Phone: {section.contactInfo.phone}
                        <br />
                        Address: {section.contactInfo.address}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button
              onClick={() => setShowPrivacyPolicyModal(false)}
              variant="outline"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setAgreedToPrivacyPolicy(true);
                setShowPrivacyPolicyModal(false);
              }}
              variant="primary"
            >
              I Agree
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white bg-opacity-95 p-8 rounded-lg shadow-xl">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join BCFI HR Application System
            </p>
          </div>

          {/* Progress Indicator */}
          {signupPhase < 4 && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= signupPhase
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-8 h-1 ${
                          step < signupPhase ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          {signupPhase === 1 && renderPhase1()}
          {signupPhase === 2 && renderPhase2()}
          {signupPhase === 3 && renderPhase3()}
          {signupPhase === 4 && renderPhase4()}

          {signupPhase < 4 && (
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in here
                </Link>
              </span>
            </div>
          )}
        </div>

        {/* Privacy Policy Modal */}
        {renderPrivacyPolicyModal()}
      </div>
    </div>
  );
};

export default SignupForm;
