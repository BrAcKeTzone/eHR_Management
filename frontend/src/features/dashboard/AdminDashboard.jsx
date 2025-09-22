import React from "react";
import { useSelector } from "react-redux";
import UserManagement from "./UserManagement";
import PostList from "../posts/PostList";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user || user.role !== "admin") {
    return <p className="text-red-500">Access Denied: Admins Only</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border p-4 rounded shadow">
          <h3 className="text-xl font-semibold">User Management</h3>
          <UserManagement />
        </div>
        <div className="border p-4 rounded shadow">
          <h3 className="text-xl font-semibold">Manage Posts</h3>
          <PostList />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
