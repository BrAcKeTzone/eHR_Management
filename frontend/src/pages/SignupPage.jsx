import React from "react";
import MainLayout from "../layouts/MainLayout";
import SignupForm from "../features/auth/SignupForm";

const SignupPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto flex justify-center items-center min-h-screen">
        <SignupForm />
      </div>
    </MainLayout>
  );
};

export default SignupPage;
