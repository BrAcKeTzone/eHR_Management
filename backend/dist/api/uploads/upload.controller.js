"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileInfo = exports.deleteFile = exports.uploadBase64Image = exports.uploadMultipleFiles = exports.uploadFile = void 0;
const path_1 = __importDefault(require("path"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const cloudinary_1 = require("../../utils/cloudinary");
/**
 * Upload single file to Cloudinary with specified folder destination
 */
exports.uploadFile = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.file) {
        throw new ApiError_1.default(400, "No file uploaded");
    }
    // Determine the upload folder based on the request type
    const uploadType = req.query.type || "general";
    let folder = "bcfi_hr/general";
    let resourceType = "auto";
    // Set the appropriate folder based on upload type
    switch (uploadType) {
        case "application":
            folder = "bcfi_hr/applications";
            resourceType = "auto";
            break;
        case "id":
            folder = "bcfi_hr/valid_ids";
            resourceType = "image";
            break;
        case "document":
            folder = "bcfi_hr/documents";
            resourceType = "raw";
            break;
        case "profile":
            folder = "bcfi_hr/profiles";
            resourceType = "image";
            break;
        default:
            folder = "bcfi_hr/general";
            resourceType = "auto";
    }
    console.log(`Uploading file to ${folder} as ${resourceType}`);
    // Get file extension
    const fileExt = path_1.default.extname(req.file.originalname);
    const baseName = path_1.default.basename(req.file.originalname, fileExt);
    // Format filename
    const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const timestamp = Date.now();
    const publicId = `${dateStr}_${timestamp}_${baseName}`;
    // Upload file buffer to Cloudinary
    const result = await (0, cloudinary_1.uploadBuffer)(req.file.buffer, {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        use_filename: true,
        unique_filename: false,
        timeout: 60000,
    });
    res.status(200).json(new ApiResponse_1.default(200, {
        url: result.secure_url,
        public_id: result.public_id,
        originalname: req.file.originalname,
        fileName: `${publicId}${fileExt}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadType,
        folder,
        fileExt,
        resource_type: result.resource_type,
    }, "File uploaded successfully"));
});
/**
 * Upload multiple files to Cloudinary
 */
exports.uploadMultipleFiles = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new ApiError_1.default(400, "No files uploaded");
    }
    // Determine the upload folder based on the request type
    const uploadType = req.query.type || "document";
    let folder = "bcfi_hr/documents";
    let resourceType = "auto";
    switch (uploadType) {
        case "application":
            folder = "bcfi_hr/applications";
            resourceType = "auto";
            break;
        case "document":
            folder = "bcfi_hr/documents";
            resourceType = "raw";
            break;
        default:
            folder = "bcfi_hr/general";
            resourceType = "auto";
    }
    const dateStr = new Date().toISOString().split("T")[0];
    console.log(`Uploading ${req.files.length} files to ${folder} as ${resourceType}`);
    // Upload files sequentially to prevent overwhelming the server
    const uploadedFiles = [];
    const failedFiles = [];
    for (const file of req.files) {
        try {
            const fileExt = path_1.default.extname(file.originalname);
            const baseName = path_1.default.basename(file.originalname, fileExt);
            const timestamp = Date.now();
            const publicId = `${dateStr}_${timestamp}_${baseName}`;
            const result = await (0, cloudinary_1.uploadBuffer)(file.buffer, {
                folder,
                resource_type: resourceType,
                public_id: publicId,
                use_filename: false,
                unique_filename: false,
                timeout: 60000,
            });
            uploadedFiles.push({
                url: result.secure_url,
                public_id: result.public_id,
                originalname: file.originalname,
                fileName: `${publicId}${fileExt}`,
                size: file.size,
                mimetype: file.mimetype,
                fileExt,
                resource_type: result.resource_type,
            });
        }
        catch (fileError) {
            console.error(`Error uploading file ${file.originalname}:`, fileError);
            failedFiles.push({
                originalname: file.originalname,
                error: fileError.message,
            });
        }
    }
    if (uploadedFiles.length === 0) {
        throw new ApiError_1.default(500, "All file uploads failed. Please try again with smaller files or check your connection.");
    }
    const message = uploadedFiles.length === req.files.length
        ? "All files uploaded successfully"
        : `${uploadedFiles.length} out of ${req.files.length} files uploaded successfully`;
    res.status(200).json(new ApiResponse_1.default(200, {
        files: uploadedFiles,
        failed: failedFiles,
        uploadType,
        folder,
        partialSuccess: uploadedFiles.length < req.files.length,
    }, message));
});
/**
 * Upload base64 encoded image to Cloudinary
 */
exports.uploadBase64Image = (0, asyncHandler_1.default)(async (req, res) => {
    const { image } = req.body;
    if (!image) {
        throw new ApiError_1.default(400, "No image data provided");
    }
    // Determine the upload folder based on the request type
    const uploadType = req.query.type || "profile";
    let folder = "bcfi_hr/profiles";
    switch (uploadType) {
        case "profile":
            folder = "bcfi_hr/profiles";
            break;
        case "id":
            folder = "bcfi_hr/valid_ids";
            break;
        default:
            folder = "bcfi_hr/general";
    }
    const result = await (0, cloudinary_1.uploadBase64)(image, {
        folder,
        resource_type: "image",
        timeout: 60000,
    });
    res.status(200).json(new ApiResponse_1.default(200, {
        url: result.secure_url,
        public_id: result.public_id,
        uploadType,
        folder,
    }, "Image uploaded successfully"));
});
/**
 * Delete file from Cloudinary
 */
exports.deleteFile = (0, asyncHandler_1.default)(async (req, res) => {
    const { publicId } = req.params;
    if (!publicId) {
        throw new ApiError_1.default(400, "No public ID provided");
    }
    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    const result = await (0, cloudinary_1.deleteImage)(decodedPublicId);
    if (result.result === "ok") {
        res
            .status(200)
            .json(new ApiResponse_1.default(200, result, "File deleted successfully"));
    }
    else {
        throw new ApiError_1.default(400, "Failed to delete file");
    }
});
/**
 * Get file information from Cloudinary
 */
exports.getFileInfo = (0, asyncHandler_1.default)(async (req, res) => {
    const { publicId } = req.params;
    if (!publicId) {
        throw new ApiError_1.default(400, "No public ID provided");
    }
    // Note: This would require implementing getResourceDetails in cloudinary utils
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { publicId }, "File info retrieved successfully"));
});
//# sourceMappingURL=upload.controller.js.map