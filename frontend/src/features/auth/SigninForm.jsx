import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Input from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";

const SigninForm = () => {
  const navigate = useNavigate();
  const {
    login,
    verifyLoginOtp,
    resetLogin,
    loading,
    error,
    clearError,
    loginPhase,
    loginData,
  } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      const result = await login(formData);

      // Check if OTP verification is required
      if (result.requiresOtp) {
        setOtpSent(true);
      } else {
        // Direct login (fallback, shouldn't happen with new flow)
        navigateToDashboard(result.user);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      return;
    }

    try {
      const { user } = await verifyLoginOtp(otp);
      navigateToDashboard(user);
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  const navigateToDashboard = (user) => {
    if (user?.role === "HR") {
      navigate("/hr/dashboard");
    } else {
      navigate("/applicant/dashboard");
    }
  };

  const handleBackToLogin = () => {
    resetLogin();
    setOtpSent(false);
    setOtp("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {loginPhase === 2 || otpSent
              ? "Verify OTP"
              : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            BCFI HR Application System
          </p>
        </div>

        {loginPhase === 1 && !otpSent ? (
          // Phase 1: Email and Password
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Email address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />

              <PasswordInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? <LoadingSpinner size="sm" /> : "Continue"}
            </Button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up here
                </Link>
              </span>
            </div>
          </form>
        ) : (
          // Phase 2: OTP Verification
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              <p className="text-sm">
                An OTP has been sent to{" "}
                <strong>{loginData.email || formData.email}</strong>
              </p>
              <p className="text-xs mt-1">
                Please check your email and enter the code below.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Enter OTP"
                name="otp"
                type="text"
                value={otp}
                onChange={handleOtpChange}
                required
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                pattern="[0-9]{6}"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || !otp || otp.length !== 6}
            >
              {loading ? <LoadingSpinner size="sm" /> : "Verify & Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                ← Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SigninForm;
