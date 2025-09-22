import React from "react";
import MainLayout from "../layouts/MainLayout";
import SigninForm from "../features/auth/SigninForm";

const SigninPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto flex justify-center items-center min-h-screen">
        <SigninForm />
      </div>
    </MainLayout>
  );
};

export default SigninPage;
