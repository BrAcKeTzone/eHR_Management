import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { signin } from "./authSlice";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

const SigninForm = () => {
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "Minimum 6 characters")
        .required("Password is required"),
    }),
    onSubmit: (values) => {
      dispatch(signin(values));
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="p-4 border rounded-lg shadow-md"
    >
      <h2 className="text-xl font-bold mb-4">Sign In</h2>
      <Input
        type="email"
        placeholder="Email"
        {...formik.getFieldProps("email")}
      />
      {formik.touched.email && formik.errors.email ? (
        <p className="text-red-500">{formik.errors.email}</p>
      ) : null}

      <Input
        type="password"
        placeholder="Password"
        {...formik.getFieldProps("password")}
      />
      {formik.touched.password && formik.errors.password ? (
        <p className="text-red-500">{formik.errors.password}</p>
      ) : null}

      <Button type="submit" className="w-full mt-4">
        Sign In
      </Button>
    </form>
  );
};

export default SigninForm;
