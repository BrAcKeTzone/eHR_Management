import Joi from "joi";

export const createUser = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  name: Joi.string().required(),
  phone: Joi.string().optional().allow(""),
  role: Joi.string().valid("APPLICANT", "HR").optional(),
});

export const updateUser = Joi.object().keys({
  email: Joi.string().email().optional(),
  name: Joi.string().optional(),
  phone: Joi.string().optional().allow(""),
  role: Joi.string().valid("APPLICANT", "HR").optional(),
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
  sortBy: Joi.string().valid("name", "email", "role", "createdAt").optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
});
