import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiBarChart,
} from "react-icons/fi";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">
            BCFI HR System
          </div>
          <div className="space-x-4">
            <Link
              to="/signin"
              className="px-6 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Streamline Your Hiring Process
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              BCFI HR Application System simplifies recruitment with secure
              applications, real-time tracking, and intelligent evaluation tools
              for both applicants and HR teams.
            </p>
            <div className="flex gap-4">
              <Link
                to="/signup"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2 transition"
              >
                Get Started <FiArrowRight />
              </Link>
              <Link
                to="/signin"
                className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 font-semibold transition"
              >
                Sign In
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg shadow-xl p-8 text-white">
              <div className="text-center py-12">
                <FiFileText className="w-20 h-20 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Professional Application Management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Key Features
          </h2>

          {/* For Applicants */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              <FiUsers className="text-indigo-600" />
              For Applicants
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FiFileText className="w-8 h-8" />}
                title="Easy Application"
                description="Submit comprehensive applications with required and optional documents in a streamlined interface."
              />
              <FeatureCard
                icon={<FiCalendar className="w-8 h-8" />}
                title="Interview Scheduling"
                description="View, manage, and confirm your scheduled interviews and demonstrations in real-time."
              />
              <FeatureCard
                icon={<FiBarChart3 className="w-8 h-8" />}
                title="Track Progress"
                description="Monitor your application status at every stage with detailed updates and notifications."
              />
            </div>
          </div>

          {/* For HR */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              <FiUsers className="text-indigo-600" />
              For HR Team
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FiFileText className="w-8 h-8" />}
                title="Application Review"
                description="Review applications, verify documents, and manage the complete applicant pipeline efficiently."
              />
              <FeatureCard
                icon={<FiBarChart3 className="w-8 h-8" />}
                title="Scoring & Evaluation"
                description="Use customizable rubrics to score applicants and generate comprehensive evaluation reports."
              />
              <FeatureCard
                icon={<FiCalendar className="w-8 h-8" />}
                title="Schedule Management"
                description="Schedule interviews and demos, manage user accounts, and automate notifications."
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Create Account"
              description="Sign up with email verification and OTP confirmation"
            />
            <StepCard
              number="2"
              title="Submit Application"
              description="Upload documents and provide your professional information"
            />
            <StepCard
              number="3"
              title="HR Review"
              description="HR team reviews and scores your application"
            />
            <StepCard
              number="4"
              title="Interview"
              description="Schedule and attend your interview or demo"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 dark:bg-indigo-900 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join BCFI and streamline your hiring experience today.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 font-semibold transition"
            >
              Create Account
            </Link>
            <Link
              to="/signin"
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">About BCFI</h4>
              <p className="text-sm">
                Blancia College Foundation Inc. - Transforming HR Management
                Through Technology
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <Link to="/signin" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-white">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-sm text-center">
            <p>
              &copy; 2025 Blancia College Foundation Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg hover:shadow-lg transition">
    <div className="text-indigo-600 dark:text-indigo-400 mb-4">{icon}</div>
    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
      {title}
    </h4>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

// Step Card Component
const StepCard = ({ number, title, description }) => (
  <div className="text-center">
    <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
      {number}
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

export default LandingPage;
