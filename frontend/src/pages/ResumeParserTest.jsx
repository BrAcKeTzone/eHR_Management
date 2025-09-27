import React, { useState } from "react";
import { parseResume } from "../utils/resumeParser";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";

const ResumeParserTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("Starting to parse file:", file.name);
      const parseResult = await parseResume(file);
      console.log("Parse result:", parseResult);
      setResult(parseResult);
    } catch (err) {
      console.error("Error parsing resume:", err);
      setError(err.message || "Failed to parse resume");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Resume Parser Test</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Resume to Test</h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
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
            <span className="text-lg text-gray-600">
              Click to upload resume
            </span>
            <span className="text-sm text-gray-500 mt-1">
              PDF, TXT, DOC, DOCX files supported
            </span>
          </label>
        </div>

        {isLoading && (
          <div className="mt-6 flex items-center justify-center">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Parsing resume...</span>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Parse Results</h3>

            {result.success ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="font-medium text-green-900 mb-3">
                  ✅ Successfully Parsed!
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      Personal Information
                    </h5>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong> {result.data.firstName}{" "}
                        {result.data.lastName}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {result.data.email || "Not found"}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {result.data.phone || "Not found"}
                      </p>
                      <p>
                        <strong>Address:</strong>{" "}
                        {result.data.address || "Not found"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      Professional Information
                    </h5>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Program:</strong>{" "}
                        {result.data.program || "Not detected"}
                      </p>
                      <p>
                        <strong>Position:</strong>{" "}
                        {result.data.position || "Not detected"}
                      </p>
                      <p>
                        <strong>Specialization:</strong>{" "}
                        {result.data.subjectSpecialization || "Not detected"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Education</h5>
                  <p className="text-sm text-gray-700">
                    {result.data.educationalBackground || "Not extracted"}
                  </p>
                </div>

                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">
                    Teaching Experience
                  </h5>
                  <p className="text-sm text-gray-700">
                    {result.data.teachingExperience || "Not extracted"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <strong>Failed to parse:</strong> {result.message}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="font-medium text-blue-900 mb-2">How to Test</h3>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>
            Download the sample resume:{" "}
            <a href="/sample-resume.txt" className="underline" download>
              sample-resume.txt
            </a>
          </li>
          <li>Upload it using the file picker above</li>
          <li>Watch as the resume gets parsed automatically</li>
          <li>Check the extracted information in the results section</li>
        </ol>
      </div>
    </div>
  );
};

export default ResumeParserTest;
