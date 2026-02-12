import React, { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "sm:w-96",
    md: "sm:w-1/2 sm:max-w-2xl",
    lg: "sm:w-2/3 sm:max-w-4xl",
    xl: "sm:w-3/4 sm:max-w-6xl",
    full: "sm:w-11/12 sm:max-w-7xl",
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 sm:p-4"
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white sm:rounded-lg shadow-xl w-full ${sizeClasses[size]} h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-none">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
        {!title && showCloseButton && (
          <div className="p-4 border-t border-gray-200 flex-none">
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
