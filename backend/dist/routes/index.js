"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_route_1 = __importDefault(require("../api/auth/auth.route"));
const users_route_1 = __importDefault(require("../api/users/users.route"));
const applications_route_1 = __importDefault(require("../api/applications/applications.route"));
const reports_route_1 = __importDefault(require("../api/reports/reports.route"));
const uploads_route_1 = __importDefault(require("./uploads.route"));
router.use("/auth", auth_route_1.default);
router.use("/users", users_route_1.default);
router.use("/applications", applications_route_1.default);
router.use("/reports", reports_route_1.default);
router.use("/uploads", uploads_route_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map