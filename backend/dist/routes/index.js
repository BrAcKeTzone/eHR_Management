"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const health_route_1 = __importDefault(require("./health.route"));
const auth_route_1 = __importDefault(require("../api/auth/auth.route"));
const users_route_1 = __importDefault(require("../api/users/users.route"));
const applications_route_1 = __importDefault(require("../api/applications/applications.route"));
const reports_route_1 = __importDefault(require("../api/reports/reports.route"));
const uploads_route_1 = __importDefault(require("./uploads.route"));
const specializations_route_1 = __importDefault(require("../api/specializations/specializations.route"));
const pre_employment_routes_1 = __importDefault(require("../api/pre-employment/pre-employment.routes"));
const notifications_route_1 = __importDefault(require("../api/notifications/notifications.route"));
router.use("/health", health_route_1.default);
router.use("/auth", auth_route_1.default);
router.use("/users", users_route_1.default);
router.use("/applications", applications_route_1.default);
router.use("/reports", reports_route_1.default);
router.use("/uploads", uploads_route_1.default);
router.use("/specializations", specializations_route_1.default);
router.use("/pre-employment", pre_employment_routes_1.default);
router.use("/notifications", notifications_route_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map