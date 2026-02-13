"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const specializations_controller_1 = require("./specializations.controller");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const rbac_middleware_1 = require("../../middlewares/rbac.middleware");
const router = express_1.default.Router();
router.get("/", auth_middleware_1.default, specializations_controller_1.getSpecializations);
router.post("/", auth_middleware_1.default, rbac_middleware_1.requireHR, specializations_controller_1.createSpecialization);
router.delete("/:id", auth_middleware_1.default, rbac_middleware_1.requireHR, specializations_controller_1.deleteSpecialization);
exports.default = router;
//# sourceMappingURL=specializations.route.js.map