"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModificationRights = exports.requireOwnershipOrHR = exports.requireHR = void 0;
const ApiError_1 = __importDefault(require("../utils/ApiError"));
// Check if user has HR role
const requireHR = (req, res, next) => {
    if (!req.user) {
        return next(new ApiError_1.default(401, "Authentication required"));
    }
    if (req.user.role !== "HR") {
        return next(new ApiError_1.default(403, "HR access required"));
    }
    next();
};
exports.requireHR = requireHR;
// Check if user is accessing their own resource or is HR
const requireOwnershipOrHR = (req, res, next) => {
    if (!req.user) {
        return next(new ApiError_1.default(401, "Authentication required"));
    }
    const userId = parseInt(req.params.id);
    // Allow if user is HR or accessing their own resource
    if (req.user.role === "HR" || req.user.id === userId) {
        return next();
    }
    return next(new ApiError_1.default(403, "Access denied. You can only access your own resources"));
};
exports.requireOwnershipOrHR = requireOwnershipOrHR;
// Check if user can modify the target user
const requireModificationRights = (req, res, next) => {
    if (!req.user) {
        return next(new ApiError_1.default(401, "Authentication required"));
    }
    const userId = parseInt(req.params.id);
    // HR can modify anyone except other HR users (checked in service layer)
    // Users can only modify themselves
    if (req.user.role === "HR" || req.user.id === userId) {
        return next();
    }
    return next(new ApiError_1.default(403, "Access denied. Insufficient permissions"));
};
exports.requireModificationRights = requireModificationRights;
exports.default = {
    requireHR: exports.requireHR,
    requireOwnershipOrHR: exports.requireOwnershipOrHR,
    requireModificationRights: exports.requireModificationRights,
};
//# sourceMappingURL=rbac.middleware.js.map