import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import privacyPolicyData from "../data/privacyPolicy.json";

const LandingPage = () => {
  const navigate = useNavigate();
  const contactInfo = privacyPolicyData.sections[9].contactInfo;

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Application Process */}
      <section id="process" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple & Transparent Process
            </h2>
            <p className="text-lg text-gray-600">
              Get from application to interview in just 4 simple steps
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  num: "01",
                  title: "Create Account",
                  desc: "Sign up with your email and secure OTP verification",
                  icon: "📧",
                },
                {
                  num: "02",
                  title: "Personal Details",
                  desc: "Share your background and professional information",
                  icon: "👤",
                },
                {
                  num: "03",
                  title: "Upload Documents",
                  desc: "Submit resume, certificates, and supporting documents",
                  icon: "📄",
                },
                {
                  num: "04",
                  title: "Get Reviewed",
                  desc: "Our team reviews and schedules your interview",
                  icon: "✓",
                },
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white mb-6 shadow-lg mx-auto">
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Process CTA */}
          <div className="text-center mt-16">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/signup")}
              className="shadow-lg hover:shadow-xl transition-all"
            >
              Begin Your Application
            </Button>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                We're Looking For
              </h2>
              <ul className="space-y-4">
                {[
                  "Bachelor's degree in Education or relevant field",
                  "Passion for teaching and student development",
                  "Strong communication and interpersonal skills",
                  "Commitment to professional excellence",
                  "Ability to inspire and motivate students",
                  "Experience with modern teaching methodologies",
                ].map((req, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600">
                        <svg
                          className="h-4 w-4 text-white"
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
                    </div>
                    <span className="text-gray-700 text-lg">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-10 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-5xl font-bold text-blue-600">Ready?</span>
                <p className="text-gray-600">
                  Start your journey with BCFI today
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Estimated time:</span> 15-20
                    minutes to complete
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-900">
                    <span className="font-semibold">Response time:</span> 2-3
                    weeks after submission
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/signup")}
                className="w-full shadow-lg"
              >
                Apply Now
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/signin")}
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
