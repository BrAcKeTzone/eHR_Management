import Joi from "joi";

export const sendOtp = Joi.object().keys({
  email: Joi.string().email().required(),
});

export const verifyOtp = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const verifyLoginOtp = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
  role: Joi.string().valid("APPLICANT", "HR").required(),
});

export const verifyOtpForReset = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const verifyOtpForChange = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const sendOtpReset = Joi.object().keys({
  email: Joi.string().email().required(),
});

export const sendOtpChange = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const register = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid("APPLICANT", "HR", "ADMIN").optional(),
  civilStatus: Joi.string().optional(),
  houseNo: Joi.string().optional(),
  street: Joi.string().optional(),
  barangay: Joi.string().optional(),
  city: Joi.string().optional(),
  province: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  education: Joi.array()
    .items(
      Joi.object({
        school: Joi.string().required(),
        course: Joi.string().required(),
        yearGraduated: Joi.string().required(),
      }),
    )
    .optional(),
  references: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        contactNo: Joi.string().required(),
        relationship: Joi.string().required(),
      }),
    )
    .optional(),
});

export const login = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid("APPLICANT", "HR").required(),
});

export const resetPassword = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
  password: Joi.string().required().min(8),
});

export const changePassword = Joi.object().keys({
  email: Joi.string().email().required(),
  oldPassword: Joi.string().required(),
  otp: Joi.string().required(),
  newPassword: Joi.string().required().min(8),
});
