"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersController = __importStar(require("./users.controller"));
const usersValidation = __importStar(require("./users.validation"));
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const rbac_middleware_1 = require("../../middlewares/rbac.middleware");
const router = express_1.default.Router();
// All user routes require authentication
router.use(auth_middleware_1.default);
// GET /api/users/me - Get current user profile
router.get("/me", usersController.getCurrentUser);
// GET /api/users - Get all users with pagination and filtering (HR only)
router.get("/", rbac_middleware_1.requireHR, (0, validate_middleware_1.default)(usersValidation.getUsersQuery, "query"), usersController.getAllUsers);
// GET /api/users/stats - Get user statistics (HR only)
router.get("/stats", rbac_middleware_1.requireHR, usersController.getUserStats);
// GET /api/users/:id - Get user by ID (HR or own profile)
router.get("/:id", rbac_middleware_1.requireOwnershipOrHR, usersController.getUserById);
// POST /api/users - Create new user (HR only)
router.post("/", rbac_middleware_1.requireHR, (0, validate_middleware_1.default)(usersValidation.createUser), usersController.createUser);
// PUT /api/users/me - Update current user profile
router.put("/me", (0, validate_middleware_1.default)(usersValidation.updateUser), usersController.updateCurrentUser);
// PUT /api/users/:id - Update user (HR for others, or own profile)
router.put("/:id", rbac_middleware_1.requireModificationRights, (0, validate_middleware_1.default)(usersValidation.updateUser), usersController.updateUser);
// PUT /api/users/:id/password - Update user password (own profile only)
router.put("/:id/password", rbac_middleware_1.requireOwnershipOrHR, (0, validate_middleware_1.default)(usersValidation.updateUserPassword), usersController.updateUserPassword);
// DELETE /api/users/:id - Delete user (HR only, cannot delete HR users)
router.delete("/:id", rbac_middleware_1.requireHR, usersController.deleteUser);
exports.default = router;
//# sourceMappingURL=users.route.js.map