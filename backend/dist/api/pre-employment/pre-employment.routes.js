"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pre_employment_controller_1 = require("./pre-employment.controller");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const upload_middleware_1 = __importDefault(require("../../middlewares/upload.middleware"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.default);
const uploadFields = upload_middleware_1.default.fields([
    { name: "photo2x2", maxCount: 1 },
    { name: "coe", maxCount: 1 },
    { name: "marriageContract", maxCount: 1 },
    { name: "prcLicense", maxCount: 1 },
    { name: "civilService", maxCount: 1 },
    { name: "mastersUnits", maxCount: 1 },
    { name: "car", maxCount: 1 },
    { name: "tor", maxCount: 1 },
    { name: "certificates", maxCount: 1 },
    { name: "tesdaFiles", maxCount: 10 },
]);
router.get("/", pre_employment_controller_1.getPreEmploymentHandler);
const setUploadFolder = (req, res, next) => {
    req.uploadFolder = "hr-applications/pre-employment";
    next();
};
router.post("/", setUploadFolder, uploadFields, pre_employment_controller_1.upsertPreEmploymentHandler);
router.delete("/", pre_employment_controller_1.deletePreEmploymentHandler);
exports.default = router;
//# sourceMappingURL=pre-employment.routes.js.map