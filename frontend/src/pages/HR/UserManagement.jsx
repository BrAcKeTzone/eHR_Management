import React, { useEffect, useState } from "react";
import { useUserManagementStore } from "../../store/userManagementStore";
import { useAuthStore } from "../../store/authStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { formatDate } from "../../utils/formatDate";

const UserManagement = () => {
  const { user: currentUser } = useAuthStore();
  const { users, getAllUsers, deleteUser, addUser, loading, error } =
    useUserManagementStore();

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [filters, setFilters] = useState({
    role: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: "APPLICANT",
    password: "",
    confirmPassword: "",
  });

  const [addUserError, setAddUserError] = useState("");

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    if (users) {
      let filtered = [...users];

      // Filter by role
      if (filters.role) {
        filtered = filtered.filter((user) => user.role === filters.role);
      }

      // Filter by search (name or email)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (user) =>
            user.firstName.toLowerCase().includes(searchLower) ||
            user.lastName.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
      }

      // Filter by date range
      if (filters.startDate) {
        filtered = filtered.filter(
          (user) => new Date(user.createdAt) >= new Date(filters.startDate)
        );
      }

      if (filters.endDate) {
        filtered = filtered.filter(
          (user) => new Date(user.createdAt) <= new Date(filters.endDate)
        );
      }

      setFilteredUsers(filtered);
    }
  }, [users, filters]);

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
        // Refresh users list
        getAllUsers();
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
        address: newUserData.address,
        role: newUserData.role,
        password: newUserData.password,
      });

      setShowAddUserModal(false);
      setNewUserData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        role: "APPLICANT",
        password: "",
        confirmPassword: "",
      });

      // Refresh users list
      getAllUsers();
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
          <p className="font-medium text-gray-900">
            {row.firstName} {row.lastName}
          </p>
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
      accessor: "phoneNumber",
      cell: (row) => (
        <div className="text-sm text-gray-600">
          {row.phoneNumber || "Not provided"}
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

  const stats = {
    total: filteredUsers.length,
    hr: filteredUsers.filter((user) => user.role === "HR").length,
    applicants: filteredUsers.filter((user) => user.role === "APPLICANT")
      .length,
  };

  if (loading && !users) {
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
            {stats.total}
          </div>
        </DashboardCard>

        <DashboardCard title="HR Managers" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">
            {stats.hr}
          </div>
        </DashboardCard>

        <DashboardCard title="Applicants" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {stats.applicants}
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
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="HR">HR Manager</option>
              <option value="APPLICANT">Applicant</option>
            </select>
          </div>

          <Input
            label="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Name or email"
          />

          <Input
            label="From Date"
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />

          <Input
            label="To Date"
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() =>
              setFilters({
                role: "",
                search: "",
                startDate: "",
                endDate: "",
              })
            }
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      </DashboardCard>

      {/* Users Table */}
      <DashboardCard title={`Users (${filteredUsers.length})`}>
        {filteredUsers.length > 0 ? (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table columns={usersColumns} data={filteredUsers} />
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredUsers.map((user, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 break-words">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 break-all">
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {user.phoneNumber || "No phone provided"}
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
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No users found matching your criteria.
            </p>
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
            address: "",
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

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={newUserData.address}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, address: e.target.value })
                }
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address"
              />
            </div>

            <Input
              label="Password"
              type="password"
              value={newUserData.password}
              onChange={(e) =>
                setNewUserData({ ...newUserData, password: e.target.value })
              }
              required
              minLength={6}
            />

            <Input
              label="Confirm Password"
              type="password"
              value={newUserData.confirmPassword}
              onChange={(e) =>
                setNewUserData({
                  ...newUserData,
                  confirmPassword: e.target.value,
                })
              }
              required
              minLength={6}
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
                  address: "",
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
            <strong>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </strong>
            ? This action cannot be undone.
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
