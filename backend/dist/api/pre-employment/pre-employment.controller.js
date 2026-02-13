"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePreEmploymentHandler = exports.upsertPreEmploymentHandler = exports.getPreEmploymentHandler = void 0;
const pre_employment_service_1 = require("./pre-employment.service");
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
exports.getPreEmploymentHandler = (0, asyncHandler_1.default)(async (req, res, next) => {
    const userId = req.user.id;
    const requirements = await (0, pre_employment_service_1.getPreEmployment)(userId);
    if (requirements) {
        // Helper function to append .pdf to Cloudinary URLs if missing
        const appendPdfExtension = (url) => {
            if (!url || typeof url !== "string")
                return url;
            // Only append for documents, and only if not already there
            if (url.includes("cloudinary.com") &&
                !url.toLowerCase().endsWith(".pdf") &&
                !url.toLowerCase().endsWith(".png") &&
                !url.toLowerCase().endsWith(".jpg") &&
                !url.toLowerCase().endsWith(".jpeg")) {
                return `${url}.pdf`;
            }
            return url;
        };
        // Apply to document fields
        const docFields = [
            "coe",
            "marriageContract",
            "prcLicense",
            "civilService",
            "mastersUnits",
            "car",
            "tor",
            "otherCert",
        ];
        docFields.forEach((field) => {
            if (requirements[field]) {
                requirements[field] = appendPdfExtension(requirements[field]);
            }
        });
        // Handle tesdaCerts (JSON array)
        if (requirements.tesdaCerts) {
            try {
                const certs = JSON.parse(requirements.tesdaCerts);
                if (Array.isArray(certs)) {
                    requirements.tesdaCerts = JSON.stringify(certs.map((url) => appendPdfExtension(url)));
                }
            }
            catch (e) {
                // Keep as is if invalid JSON
            }
        }
    }
    res
        .status(200)
        .json(new ApiResponse_1.default(200, requirements, "Pre-employment requirements retrieved successfully"));
});
exports.upsertPreEmploymentHandler = (0, asyncHandler_1.default)(async (req, res, next) => {
    const userId = req.user.id;
    const body = req.body;
    const files = req.files;
    // Build data object from body and files
    const data = {
        sss: body.sss,
        philhealth: body.philhealth,
        tin: body.tin,
        pagibig: body.pagibig,
    };
    // Handle single file uploads
    const fileFields = [
        "photo2x2",
        "coe",
        "marriageContract",
        "prcLicense",
        "civilService",
        "mastersUnits",
        "car",
        "tor",
        "otherCert",
    ];
    fileFields.forEach((field) => {
        if (files && files[field] && files[field][0]) {
            data[field] = files[field][0].path; // Cloudinary URL
        }
    });
    // Handle multiple file uploads (TESDA)
    // If files are uploaded, we store them.
    // Ideally, we should fetch existing ones and append if needed, but for now let's overwrite or handle new ones.
    // If the frontend handles "appending" by re-sending previous files (not possible with file input unless using DataTransfer or similar),
    // usually we append new files to the list in DB.
    if (files && files["tesdaFiles"]) {
        // Get existing to append?
        const existing = await (0, pre_employment_service_1.getPreEmployment)(userId);
        let existingTesda = [];
        if (existing && existing.tesdaCerts) {
            try {
                existingTesda = JSON.parse(existing.tesdaCerts);
            }
            catch (e) {
                existingTesda = [];
            }
        }
        const newTesda = files["tesdaFiles"].map((f) => f.path);
        // Combine (or just use new if that's the desired behavior. Let's append for now as default safe behavior for multi-upload)
        // Wait, if user wants to remove, they can't.
        // For a simple implementation, let's assume this endpoint usage adds files.
        // A robust solution needs separate delete endpoint or full replacement logic.
        // Let's implement APPEND for Tesda.
        const combined = [...existingTesda, ...newTesda];
        data.tesdaCerts = JSON.stringify(combined);
    }
    // If no tesda files uploaded, we don't touch the field in `data` so it stays as is in DB (via upsert logic, wait upsert replaces if created).
    // Actually prisma update only updates fields present in `data`.
    const result = await (0, pre_employment_service_1.upsertPreEmployment)(userId, data);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Pre-employment requirements saved successfully"));
});
exports.deletePreEmploymentHandler = (0, asyncHandler_1.default)(async (req, res, next) => {
    const userId = req.user.id;
    try {
        await (0, pre_employment_service_1.deletePreEmployment)(userId);
    }
    catch (error) {
        // If record doesn't exist, we don't need to do anything
    }
    res
        .status(200)
        .json(new ApiResponse_1.default(200, null, "Pre-employment records cleared successfully"));
});
//# sourceMappingURL=pre-employment.controller.js.map