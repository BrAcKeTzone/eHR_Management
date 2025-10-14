"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.uploadSingle = exports.uploadDocuments = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../configs/cloudinary"));
// Configure Cloudinary storage
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: {
        folder: "hr-applications", // Folder in Cloudinary
        allowed_formats: ["jpg", "png", "pdf", "doc", "docx", "txt"],
        public_id: (req, file) => {
            // Generate unique filename with timestamp and original name
            const timestamp = Date.now();
            const originalName = file.originalname.split(".")[0];
            return `${timestamp}-${originalName}`;
        },
    },
});
// File filter to validate file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type ${file.mimetype} is not allowed. Only JPG, PNG, PDF, DOC, DOCX, and TXT files are permitted.`), false);
    }
};
// Configure multer
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
// Middleware for multiple file uploads (up to 10 files)
exports.uploadDocuments = upload.array("documents", 10);
// Middleware for single file upload
exports.uploadSingle = upload.single("document");
// Error handling middleware for multer errors
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File too large. Maximum size is 10MB.",
            });
        }
        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files. Maximum is 10 files.",
            });
        }
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message: "Unexpected file field.",
            });
        }
    }
    if (error.message.includes("File type")) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
    next(error);
};
exports.handleUploadError = handleUploadError;
exports.default = upload;
//# sourceMappingURL=upload.middleware.js.map