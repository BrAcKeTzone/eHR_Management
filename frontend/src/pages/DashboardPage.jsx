import React from "react";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../features/dashboard/AdminDashboard";

const DashboardPage = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">HR Dashboard</h1>
        <AdminDashboard />
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
