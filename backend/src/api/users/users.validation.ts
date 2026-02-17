import Joi from "joi";

export const createUser = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().optional().allow("", null),
  role: Joi.string().valid("APPLICANT", "HR").optional(),
  civilStatus: Joi.string().optional().allow("", null),
  houseNo: Joi.string().optional().allow("", null),
  street: Joi.string().optional().allow("", null),
  barangay: Joi.string().optional().allow("", null),
  city: Joi.string().optional().allow("", null),
  province: Joi.string().optional().allow("", null),
  zipCode: Joi.string().optional().allow("", null),
  education: Joi.string().optional().allow("", null),
  references: Joi.string().optional().allow("", null),
});

export const updateUser = Joi.object().keys({
  email: Joi.string().email().optional(),
  firstName: Joi.string().min(1).optional(),
  lastName: Joi.string().min(1).optional(),
  name: Joi.string().min(1).optional(),
  phone: Joi.string().optional().allow("", null),
  phoneNumber: Joi.string().optional().allow("", null),
  role: Joi.string().valid("APPLICANT", "HR").optional(),
  civilStatus: Joi.string().optional().allow("", null),
  houseNo: Joi.string().optional().allow("", null),
  street: Joi.string().optional().allow("", null),
  barangay: Joi.string().optional().allow("", null),
  city: Joi.string().optional().allow("", null),
  province: Joi.string().optional().allow("", null),
  zipCode: Joi.string().optional().allow("", null),
  education: Joi.string().optional().allow("", null),
  references: Joi.string().optional().allow("", null),
});

export const updateUserPassword = Joi.object().keys({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(8),
});

export const getUsersQuery = Joi.object().keys({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  role: Joi.string().valid("APPLICANT", "HR").optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string()
    .valid("firstName", "lastName", "name", "email", "role", "createdAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
  specialization: Joi.number().integer().min(1).optional(),
});

export const verifyOtpForDeletion = Joi.object().keys({
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});
