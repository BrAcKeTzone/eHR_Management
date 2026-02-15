import React, { useRef } from "react";

const UploadBox = ({
  id,
  accept = ".pdf,.jpg,.jpeg,.png",
  onChange,
  label = "Click to upload file",
  subtitle = "PDF, JPG, PNG up to 10MB",
  file,
  files = [],
  onRemove,
  statusBadge = "",
  variant = "neutral",
  disabled = false,
}) => {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const getVariantStyles = () => {
    if (disabled) {
      return "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60";
    }
    switch (variant) {
      case "success":
        return "border-green-300 bg-green-50 hover:bg-green-100";
      case "error":
        return "border-red-300 bg-red-50 hover:bg-red-100";
      default:
        return "border-gray-300 bg-gray-50 hover:bg-gray-100";
    }
  };

  const fileList = file ? [file] : files;

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${getVariantStyles()}`}
      >
        <input
          ref={inputRef}
          type="file"
          id={id}
          accept={accept}
          onChange={onChange}
          className="hidden"
          multiple={!file && files.length > 0}
        />

        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M32 4v12m0 0l-4-4m4 4l4-4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mt-4 text-sm font-medium text-gray-900">{label}</p>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>

        {statusBadge && (
          <div className="absolute top-3 right-3">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                statusBadge === "Error"
                  ? "bg-red-200 text-red-800"
                  : statusBadge === "Required"
                  ? "bg-red-100 text-red-700"
                  : statusBadge === "Optional"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {statusBadge}
            </span>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {fileList.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileList.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
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
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">{uploadedFile.size}</p>
                </div>
              </div>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadBox;
