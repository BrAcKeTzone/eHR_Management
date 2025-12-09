"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpForDeletion = exports.getUsersQuery = exports.updateUserPassword = exports.updateUser = exports.createUser = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createUser = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required().min(8),
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    phoneNumber: joi_1.default.string().optional().allow(""),
    phone: joi_1.default.string().optional().allow(""),
    role: joi_1.default.string().valid("APPLICANT", "HR").optional(),
});
exports.updateUser = joi_1.default.object().keys({
    email: joi_1.default.string().email().optional(),
    firstName: joi_1.default.string().min(1).optional(),
    lastName: joi_1.default.string().min(1).optional(),
    name: joi_1.default.string().min(1).optional(),
    phone: joi_1.default.string().optional().allow("", null),
    phoneNumber: joi_1.default.string().optional().allow("", null),
    role: joi_1.default.string().valid("APPLICANT", "HR").optional(),
});
exports.updateUserPassword = joi_1.default.object().keys({
    currentPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string().required().min(8),
});
exports.getUsersQuery = joi_1.default.object().keys({
    page: joi_1.default.number().integer().min(1).optional(),
    limit: joi_1.default.number().integer().min(1).max(100).optional(),
    role: joi_1.default.string().valid("APPLICANT", "HR").optional(),
    search: joi_1.default.string().optional(),
    sortBy: joi_1.default.string().valid("name", "email", "role", "createdAt").optional(),
    sortOrder: joi_1.default.string().valid("asc", "desc").optional(),
});
exports.verifyOtpForDeletion = joi_1.default.object().keys({
    otp: joi_1.default.string().length(6).pattern(/^\d+$/).required(),
});
//# sourceMappingURL=users.validation.js.map