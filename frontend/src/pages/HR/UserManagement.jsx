import React, { useEffect, useState, useCallback } from "react";
import { useUserManagementStore } from "../../store/userManagementStore";
import { useAuthStore } from "../../store/authStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/formatDate";

const UserManagement = () => {
  const { user: currentUser } = useAuthStore();
  const {
    users,
    usersData,
    totalPages,
    currentPage,
    totalCount,
    getAllUsers,
    deleteUser,
    addUser,
    getUserStats,
    loading,
    error,
  } = useUserManagementStore();

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState({
    total: 0,
    hr: 0,
    applicants: 0,
    recent: 0,
  });

  const [filters, setFilters] = useState({
    role: "",
    search: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Separate state for search input to avoid triggering API calls on every keystroke
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "APPLICANT",
    password: "",
    confirmPassword: "",
  });

  const [addUserError, setAddUserError] = useState("");

  // Load initial data
  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchInput !== filters.search) {
      setIsSearching(true);
    }

    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
      setIsSearching(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Reload users when filters change (except search since it's handled by debounce)
  useEffect(() => {
    loadUsers();
  }, [
    filters.role,
    filters.page,
    filters.limit,
    filters.sortBy,
    filters.sortOrder,
    filters.search,
  ]);

  const loadUsers = async () => {
    try {
      const queryParams = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.role && { role: filters.role }),
        ...(filters.search &&
          filters.search.trim() && { search: filters.search.trim() }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      await getAllUsers(queryParams);
    } catch (error) {
      console.error("Failed to load users:", error);
      // Don't throw the error to prevent UI crashes
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getUserStats();
      setUserStats(statsData);
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 when filters change
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
  };

  const handleDeleteUser = (user) => {
    if (user.id === currentUser?.id) {
      alert("You cannot delete your own account");
      return;
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        setShowDeleteModal(false);
        setSelectedUser(null);
        // Refresh users list and stats
        await loadUsers();
        await loadStats();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError("");

    // Validate passwords
    if (newUserData.password !== newUserData.confirmPassword) {
      setAddUserError("Passwords do not match");
      return;
    }

    if (newUserData.password.length < 6) {
      setAddUserError("Password must be at least 6 characters long");
      return;
    }

    try {
      await addUser({
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        email: newUserData.email,
        phoneNumber: newUserData.phoneNumber,
        role: newUserData.role,
        password: newUserData.password,
      });

      setShowAddUserModal(false);
      setNewUserData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: "APPLICANT",
        password: "",
        confirmPassword: "",
      });

      // Refresh users list and stats
      await loadUsers();
      await loadStats();
    } catch (error) {
      setAddUserError(error.message || "Failed to add user");
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "HR":
        return "HR Manager";
      case "APPLICANT":
        return "Applicant";
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "HR":
        return "bg-purple-100 text-purple-800";
      case "APPLICANT":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const usersColumns = [
    {
      header: "User",
      accessor: "name",
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-sm text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: "role",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
            row.role
          )}`}
        >
          {getRoleDisplayName(row.role)}
        </span>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      cell: (row) => (
        <div className="text-sm text-gray-600">
          {row.phone || "Not provided"}
        </div>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      cell: (row) => (
        <div className="text-sm text-gray-600">{formatDate(row.createdAt)}</div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          {row.role === "APPLICANT" && row.id !== currentUser?.id && (
            <Button
              onClick={() => handleDeleteUser(row)}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
          {row.id === currentUser?.id && (
            <span className="text-xs text-gray-500">Current User</span>
          )}
        </div>
      ),
    },
  ];

  // Display stats from API
  const displayStats = {
    total: userStats.total || 0,
    hr: userStats.hr || 0,
    applicants: userStats.applicants || 0,
  };

  if (loading && (!users || users.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-gray-600">
          Manage user accounts, roles, and permissions.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <DashboardCard title="Total Users" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {displayStats.total}
          </div>
        </DashboardCard>

        <DashboardCard title="HR Managers" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">
            {displayStats.hr}
          </div>
        </DashboardCard>

        <DashboardCard title="Applicants" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {displayStats.applicants}
          </div>
        </DashboardCard>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setShowAddUserModal(true)}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <DashboardCard title="Filter Users" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange({ role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="HR">HR Manager</option>
              <option value="APPLICANT">Applicant</option>
            </select>
          </div>

          <div className="relative">
            <Input
              label="Search"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Name or email"
            />
            {isSearching && (
              <div className="absolute right-2 top-8 transform">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) =>
                handleFilterChange({ sortOrder: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              setFilters({
                role: "",
                search: "",
                page: 1,
                limit: 10,
                sortBy: "createdAt",
                sortOrder: "desc",
              });
              setSearchInput(""); // Also clear the search input
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      </DashboardCard>

      {/* Users Table */}
      <DashboardCard
        title={`Users (${totalCount || 0})${
          filters.search || filters.role ? " - Filtered" : ""
        }`}
      >
        {users && users.length > 0 ? (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table columns={usersColumns} data={users} />
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {users.map((user, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 break-words">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500 break-all">
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {user.phone || "No phone provided"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      Created: {formatDate(user.createdAt)}
                    </span>
                    <div className="flex space-x-2">
                      {user.role === "APPLICANT" &&
                        user.id !== currentUser?.id && (
                          <Button
                            onClick={() => handleDeleteUser(user)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        )}
                      {user.id === currentUser?.id && (
                        <span className="text-xs text-gray-500">
                          Current User
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  itemsPerPage={filters.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {loading || isSearching
                ? "Loading users..."
                : filters.search
                ? `No users found matching "${filters.search}"`
                : "No users found matching your criteria."}
            </p>
            {!loading && !isSearching && (filters.search || filters.role) && (
              <Button
                onClick={() => {
                  setFilters({
                    role: "",
                    search: "",
                    page: 1,
                    limit: 10,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  });
                  setSearchInput("");
                }}
                variant="outline"
                className="mt-3"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </DashboardCard>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => {
          setShowAddUserModal(false);
          setAddUserError("");
          setNewUserData({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            role: "APPLICANT",
            password: "",
            confirmPassword: "",
          });
        }}
        title="Add New User"
        size="large"
      >
        <form onSubmit={handleAddUser} className="space-y-4 sm:space-y-6">
          {addUserError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {addUserError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newUserData.firstName}
              onChange={(e) =>
                setNewUserData({ ...newUserData, firstName: e.target.value })
              }
              required
            />

            <Input
              label="Last Name"
              value={newUserData.lastName}
              onChange={(e) =>
                setNewUserData({ ...newUserData, lastName: e.target.value })
              }
              required
            />

            <div className="sm:col-span-2">
              <Input
                label="Email Address"
                type="email"
                value={newUserData.email}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, email: e.target.value })
                }
                required
              />
            </div>

            <Input
              label="Phone Number"
              value={newUserData.phoneNumber}
              onChange={(e) =>
                setNewUserData({ ...newUserData, phoneNumber: e.target.value })
              }
              placeholder="Enter phone number"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={newUserData.role}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="APPLICANT">Applicant</option>
                <option value="HR">HR Manager</option>
              </select>
            </div>

            <PasswordInput
              label="Password"
              name="password"
              value={newUserData.password}
              onChange={(e) =>
                setNewUserData({ ...newUserData, password: e.target.value })
              }
              required
              placeholder="Enter password (minimum 6 characters)"
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={newUserData.confirmPassword}
              onChange={(e) =>
                setNewUserData({
                  ...newUserData,
                  confirmPassword: e.target.value,
                })
              }
              required
              placeholder="Re-enter password"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddUserModal(false);
                setAddUserError("");
                setNewUserData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phoneNumber: "",
                  role: "APPLICANT",
                  password: "",
                  confirmPassword: "",
                });
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
              {loading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the user{" "}
            <strong>{selectedUser?.name}</strong>? This action cannot be undone.
          </p>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={confirmDeleteUser}
              disabled={loading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
