import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import Button from "./Button";
import Modal from "./Modal";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    selectedNotificationIds,
    toggleSelectNotification,
    clearSelection,
  } = useNotificationStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      setIsMenuOpen(false);
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);

    // Mark as read
    if (notification.status === "UNREAD") {
      await markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteSelected = async () => {
    if (selectedNotificationIds.length === 0) return;

    await deleteNotifications(selectedNotificationIds);
    clearSelection();
  };

  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "submission":
        return "📝";
      case "approval":
        return "✅";
      case "rejection":
        return "❌";
      case "schedule":
      case "reschedule":
        return "📅";
      case "result":
        return "📊";
      case "hr_alert":
        return "🔔";
      default:
        return "📬";
    }
  };

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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "HR":
        return "bg-blue-100 text-blue-800";
      case "APPLICANT":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUserInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return "U";
    return `${firstName.charAt(0).toUpperCase()}${lastName
      .charAt(0)
      .toUpperCase()}`;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Hamburger Menu for mobile */}
            {isAuthenticated && (
              <div className="lg:hidden mr-2">
                <button
                  onClick={onMenuClick}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Logo and brand */}
            <Link to="/" className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-600">BCFI</h1>
              </div>
              <div className="hidden md:block ml-2">
                <span className="text-gray-500 text-sm">
                  HR Application System
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation items */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="hidden md:flex flex-col items-end mr-3">
                <span className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user?.role,
                    )}`}
                  >
                    {getRoleDisplayName(user?.role)}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{user?.email}</span>
              </div>

              {/* Notification Icon */}
              <div className="relative">
                <button
                  onClick={() =>
                    setIsNotificationPanelOpen(!isNotificationPanelOpen)
                  }
                  className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  title="Notifications"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {/* Unread counter badge */}
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[1.25rem]">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Panel */}
                {isNotificationPanelOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[32rem] flex flex-col">
                    {/* Panel Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                        {selectedNotificationIds.length > 0 && (
                          <button
                            onClick={handleDeleteSelected}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete ({selectedNotificationIds.length})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          <p className="mt-2">No notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                                notification.status === "UNREAD"
                                  ? "bg-blue-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                {/* Checkbox */}
                                <input
                                  type="checkbox"
                                  checked={selectedNotificationIds.includes(
                                    notification.id,
                                  )}
                                  onChange={() =>
                                    toggleSelectNotification(notification.id)
                                  }
                                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  onClick={(e) => e.stopPropagation()}
                                />

                                {/* Notification Content */}
                                <div
                                  className="flex-1 cursor-pointer"
                                  onClick={() =>
                                    handleNotificationClick(notification)
                                  }
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-2 flex-1">
                                      <span className="text-xl">
                                        {getNotificationIcon(notification.type)}
                                      </span>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          {notification.subject}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                          {formatNotificationDate(
                                            notification.createdAt,
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    {notification.status === "UNREAD" && (
                                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`w-10 h-10 rounded-full font-medium text-sm hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 overflow-hidden ${
                    !user?.profilePicture &&
                    (user?.role === "HR"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white")
                  }`}
                  title={`${user?.firstName} ${
                    user?.lastName
                  } (${getRoleDisplayName(user?.role)})`}
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getUserInitials(user?.firstName, user?.lastName)
                  )}
                </button>
                {/* Online status indicator */}
                <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-medium text-gray-900 mb-1">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {user?.email}
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user?.role,
                          )}`}
                        >
                          {getRoleDisplayName(user?.role)}
                        </span>
                        {user?.phone && (
                          <span className="text-xs text-gray-400">
                            {user.phone}
                          </span>
                        )}
                      </div>
                      {user?.id && (
                        <div className="text-xs text-gray-400 mt-2">
                          ID: {user.id}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-400">
                          {currentTime.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                          <span className="text-xs text-green-600">Online</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={
                        user?.role === "HR"
                          ? "/hr/dashboard"
                          : "/applicant/dashboard"
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>

                    <Link
                      to={
                        user?.role === "HR"
                          ? "/hr/profile"
                          : "/applicant/profile"
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>

                    <hr className="border-gray-200" />

                    <button
                      onClick={handleLogoutClick}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/signin">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Click outside to close notification panel */}
      {isNotificationPanelOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsNotificationPanelOpen(false)}
        ></div>
      )}

      {/* Notification Detail Modal */}
      {showNotificationModal && selectedNotification && (
        <Modal
          isOpen={showNotificationModal}
          onClose={() => {
            setShowNotificationModal(false);
            setSelectedNotification(null);
          }}
          title="Notification Details"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <span className="text-3xl">
                {getNotificationIcon(selectedNotification.type)}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedNotification.subject}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatNotificationDate(selectedNotification.createdAt)} •{" "}
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedNotification.message}
              </p>
            </div>

            {selectedNotification.applicationId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Application ID:</span>{" "}
                  {selectedNotification.applicationId}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  selectedNotification.status === "UNREAD"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedNotification.status}
              </span>

              <Button
                variant="outline"
                onClick={() => {
                  setShowNotificationModal(false);
                  setSelectedNotification(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        title="Confirm Sign Out"
        size="sm"
      >
        <div className="space-y-6">
          <div>
            <p className="text-gray-600">
              Are you sure you want to sign out? You'll need to log in again to
              access your account.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancelLogout}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </Modal>
    </nav>
  );
};

export default Navbar;
