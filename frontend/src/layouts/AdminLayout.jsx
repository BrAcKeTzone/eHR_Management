import React from "react";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const AdminLayout = ({ children }) => {
  const { user } = useAuthStore();

  if (!user || user.role !== "HR") {
    return <p className="text-red-500">Access Denied: HR Access Only</p>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 bg-gray-100">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
