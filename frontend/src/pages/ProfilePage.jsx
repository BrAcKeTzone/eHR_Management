import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import DashboardCard from "../components/DashboardCard";
import Button from "../components/Button";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import OTPInput from "../components/OTPInput";
import Modal from "../components/Modal";
import { formatDate } from "../utils/formatDate";
import { userApi } from "../api/userApi";

const ProfilePage = () => {
  const {
    user,
    updateProfile,
    getProfile,
    changePasswordWithOtp,
    sendOtpForPasswordChange,
    loading,
    error,
    clearError,
  } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [pictureError, setPictureError] = useState("");
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    civilStatus: "",
    houseNo: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    zipCode: "",
    education: [],
    references: [],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordStep, setPasswordStep] = useState(1); // 1: Send OTP, 2: Verify OTP & Change Password
  const [otpSent, setOtpSent] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  useEffect(() => {
    // Fetch latest profile data when component mounts
    const refreshProfile = async () => {
      try {
        await getProfile();
      } catch (error) {
        console.error("Failed to refresh profile:", error);
        // Don't redirect on profile fetch errors, just log them
      }
    };

    if (user) {
      refreshProfile();
    }
  }, [getProfile]);

  useEffect(() => {
    if (user) {
      let education = [];
      let references = [];

      if (user.education) {
        try {
          education = Array.isArray(user.education)
            ? user.education
            : JSON.parse(user.education);
        } catch (e) {
          console.error("Failed to parse education:", e);
          education = [];
        }
      }

      if (user.references) {
        try {
          references = Array.isArray(user.references)
            ? user.references
            : JSON.parse(user.references);
        } catch (e) {
          console.error("Failed to parse references:", e);
          references = [];
        }
      }

      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        civilStatus: user.civilStatus || "",
        houseNo: user.houseNo || "",
        street: user.street || "",
        barangay: user.barangay || "",
        city: user.city || "",
        province: user.province || "",
        zipCode: user.zipCode || "",
        education: education,
        references: references,
      });
    }
  }, [user]);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "HR":
        return "Human Resources";
      case "APPLICANT":
        return "Applicant";
      default:
        return role;
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    clearError(); // Clear any existing errors

    // Basic validation
    if (!profileData.firstName.trim()) {
      return;
    }

    if (!profileData.lastName.trim()) {
      return;
    }

    if (!profileData.email.trim()) {
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      return;
    }

    try {
      const submitData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        civilStatus: profileData.civilStatus,
        city: profileData.city,
        province: profileData.province,
        zipCode: profileData.zipCode,
        // Stringify arrays if they're not already strings
        education: Array.isArray(profileData.education)
          ? JSON.stringify(profileData.education)
          : profileData.education,
        references: Array.isArray(profileData.references)
          ? JSON.stringify(profileData.references)
          : profileData.references,
      };

      // Only add optional address fields if they have values
      if (profileData.houseNo.trim()) submitData.houseNo = profileData.houseNo;
      if (profileData.street.trim()) submitData.street = profileData.street;
      if (profileData.barangay.trim())
        submitData.barangay = profileData.barangay;

      await updateProfile(submitData);
      setIsEditing(false);
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Error is already handled in the store and displayed via the error state
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordData.currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    try {
      await sendOtpForPasswordChange(passwordData.currentPassword);
      setPasswordStep(2);
      setOtpSent(true);
    } catch (error) {
      setPasswordError(error.message || "Failed to send OTP");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (!passwordData.otp) {
      setPasswordError("Please enter the OTP code");
      return;
    }

    try {
      await changePasswordWithOtp(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.otp,
      );
      setPasswordSuccess("Password changed successfully!");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          otp: "",
        });
        setPasswordStep(1);
        setOtpSent(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (error) {
      setPasswordError(error.message || "Failed to change password");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset profile data to original values
    if (user) {
      let education = [];
      let references = [];

      if (user.education) {
        try {
          education = Array.isArray(user.education)
            ? user.education
            : JSON.parse(user.education);
        } catch (e) {
          education = [];
        }
      }

      if (user.references) {
        try {
          references = Array.isArray(user.references)
            ? user.references
            : JSON.parse(user.references);
        } catch (e) {
          references = [];
        }
      }

      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        civilStatus: user.civilStatus || "",
        houseNo: user.houseNo || "",
        street: user.street || "",
        barangay: user.barangay || "",
        city: user.city || "",
        province: user.province || "",
        zipCode: user.zipCode || "",
        education: education,
        references: references,
      });
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setPictureError("Please upload a valid image (JPG, PNG, GIF, or WEBP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPictureError("Image size must be less than 5MB");
      return;
    }

    setUploadingPicture(true);
    setPictureError("");

    try {
      const response = await userApi.uploadProfilePicture(file);
      // Update user in auth store
      await getProfile();
      setProfileSuccess("Profile picture updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      setPictureError(error.message || "Failed to upload profile picture");
    } finally {
      setUploadingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (
      !window.confirm("Are you sure you want to remove your profile picture?")
    ) {
      return;
    }

    setUploadingPicture(true);
    setPictureError("");

    try {
      await userApi.deleteProfilePicture();
      await getProfile();
      setProfileSuccess("Profile picture removed successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      setPictureError(error.message || "Failed to remove profile picture");
    } finally {
      setUploadingPicture(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account information and security settings.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Success Display */}
      {profileSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {profileSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <DashboardCard title="Personal Information" className="h-fit">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      firstName: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  required
                  placeholder="Enter your first name"
                />

                <Input
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      lastName: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  required
                  placeholder="Enter your last name"
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                disabled={true}
                required
              />

              <Input
                label="Phone Number"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    phone: e.target.value,
                  })
                }
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />

              {/* Civil Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Civil Status
                </label>
                <select
                  value={profileData.civilStatus}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      civilStatus: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select civil status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>

              {/* Residential Address */}
              <div className="col-span-full">
                <h4 className="text-md font-semibold text-gray-700 mb-4">
                  Residential Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="House No. (Optional)"
                    value={profileData.houseNo}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        houseNo: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="House number"
                  />
                  <Input
                    label="Street (Optional)"
                    value={profileData.street}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        street: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="Street name"
                  />
                  <Input
                    label="Barangay (Optional)"
                    value={profileData.barangay}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        barangay: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="Barangay"
                  />
                  <Input
                    label="City/Municipality"
                    value={profileData.city}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        city: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="City"
                  />
                  <Input
                    label="Province"
                    value={profileData.province}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        province: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="Province"
                  />
                  <Input
                    label="Zip Code"
                    value={profileData.zipCode}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        zipCode: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="Zip code"
                  />
                </div>
              </div>

              {/* Educational Background */}
              {profileData.education && profileData.education.length > 0 && (
                <div className="col-span-full">
                  <h4 className="text-md font-semibold text-gray-700 mb-4">
                    Educational Background
                  </h4>
                  <div className="space-y-3">
                    {profileData.education.map((edu, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-md border border-gray-200"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <p className="text-sm text-gray-500">School</p>
                            <p className="mt-1 font-medium">{edu.school}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Course/Strand
                            </p>
                            <p className="mt-1 font-medium">{edu.course}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Year Graduated
                            </p>
                            <p className="mt-1 font-medium">
                              {edu.yearGraduated}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {profileData.references && profileData.references.length > 0 && (
                <div className="col-span-full">
                  <h4 className="text-md font-semibold text-gray-700 mb-4">
                    Character References
                  </h4>
                  <div className="space-y-3">
                    {profileData.references.map((ref, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-md border border-gray-200"
                      >
                        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                          Reference #{index + 1}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="mt-1 font-medium">{ref.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Contact No.</p>
                            <p className="mt-1 font-medium">{ref.contactNo}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Relationship
                            </p>
                            <p className="mt-1 font-medium">
                              {ref.relationship}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="contents">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    setIsEditing(true);
                    clearError(); // Clear any existing errors when starting to edit
                  }}
                  className="w-full sm:w-auto"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Account Summary & Security */}
        <div className="space-y-6">
          {/* Account Summary */}
          <DashboardCard title="Account Summary">
            <div className="space-y-4">
              {/* Profile Picture */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                        user?.role === "HR" ? "bg-blue-600" : "bg-green-600"
                      }`}
                    >
                      {user?.firstName && user?.lastName
                        ? `${user.firstName
                            .charAt(0)
                            .toUpperCase()}${user.lastName
                            .charAt(0)
                            .toUpperCase()}`
                        : "U"}
                    </div>
                  )}

                  {/* Edit button overlay */}
                  <button
                    onClick={handleProfilePictureClick}
                    disabled={uploadingPicture}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors disabled:opacity-50"
                    title="Change profile picture"
                  >
                    {uploadingPicture ? (
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleProfilePictureChange}
                className="hidden"
              />

              {/* Picture upload buttons */}
              {user?.profilePicture && (
                <div className="flex justify-center">
                  <button
                    onClick={handleDeleteProfilePicture}
                    disabled={uploadingPicture}
                    className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Remove picture
                  </button>
                </div>
              )}

              {/* Picture error */}
              {pictureError && (
                <div className="text-xs text-red-600 text-center">
                  {pictureError}
                </div>
              )}

              <div className="text-center">
                <h3 className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500 break-all">{user?.email}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                    user?.role === "HR"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className="font-medium">#{user?.id}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Member since:</span>
                    <span className="font-medium">
                      {formatDate(user?.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last updated:</span>
                    <span className="font-medium">
                      {formatDate(user?.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Security Settings */}
          <DashboardCard title="Security Settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-gray-600">
                    Last changed:{" "}
                    {formatDate(user?.passwordChangedAt || user?.createdAt)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change
                </Button>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError("");
          setPasswordSuccess("");
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            otp: "",
          });
          setPasswordStep(1);
          setOtpSent(false);
        }}
        title={
          passwordStep === 1
            ? "Change Password - Verify Identity"
            : "Change Password - Set New Password"
        }
      >
        {passwordStep === 1 ? (
          // Step 1: Enter current password and send OTP
          <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-6">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {passwordError}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
              <p className="text-sm">
                For security, we'll send an OTP to your email to verify the
                password change.
              </p>
            </div>

            <PasswordInput
              label="Current Password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              required
              placeholder="Enter your current password"
            />

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                    otp: "",
                  });
                  setPasswordStep(1);
                  setOtpSent(false);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </div>
          </form>
        ) : (
          // Step 2: Enter OTP and new password
          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-4 sm:space-y-6"
          >
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {passwordSuccess}
              </div>
            )}

            {otpSent && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <p className="text-sm">
                  OTP has been sent to your email ({user?.email}). Please check
                  your inbox.
                </p>
              </div>
            )}

            <OTPInput
              label="Enter OTP Code"
              value={passwordData.otp}
              onChange={(otp) =>
                setPasswordData({
                  ...passwordData,
                  otp: otp,
                })
              }
              length={6}
            />

            <PasswordInput
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              required
              placeholder="Enter new password (minimum 6 characters)"
            />

            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              required
              placeholder="Re-enter your new password"
            />

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPasswordStep(1);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setOtpSent(false);
                }}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;
