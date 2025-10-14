"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listResources = exports.getResourceDetails = exports.uploadBase64 = exports.uploadBuffer = exports.deleteMultipleImages = exports.deleteImage = void 0;
const cloudinary_1 = __importDefault(require("../configs/cloudinary"));
/**
 * Delete an image from Cloudinary by its public ID
 * @param publicId - The public ID of the image to delete
 * @returns Result of the deletion operation
 */
const deleteImage = async (publicId) => {
    if (!publicId)
        return { result: "skipped", message: "No public ID provided" };
    try {
        console.log(`Attempting to delete image with public_id: ${publicId}`);
        const result = await cloudinary_1.default.uploader.destroy(publicId);
        console.log(`Cloudinary deletion result for ${publicId}: ${result.result}`);
        return result;
    }
    catch (error) {
        console.error(`Error deleting image from Cloudinary: ${error.message}`);
        throw error;
    }
};
exports.deleteImage = deleteImage;
/**
 * Delete multiple images from Cloudinary by their public IDs
 * @param publicIds - Array of public IDs to delete
 * @returns Results of the deletion operations
 */
const deleteMultipleImages = async (publicIds) => {
    if (!publicIds || !publicIds.length)
        return [];
    try {
        const validPublicIds = publicIds.filter((id) => id);
        if (validPublicIds.length === 0)
            return [];
        console.log(`Deleting ${validPublicIds.length} images from Cloudinary`);
        // Use Promise.allSettled to handle partial failures
        const results = await Promise.allSettled(validPublicIds.map((id) => (0, exports.deleteImage)(id)));
        return results;
    }
    catch (error) {
        console.error(`Error deleting multiple images: ${error.message}`);
        throw error;
    }
};
exports.deleteMultipleImages = deleteMultipleImages;
/**
 * Upload file buffer to Cloudinary
 * @param fileBuffer - The file buffer to upload
 * @param options - Upload options (folder, resource_type, etc.)
 * @returns Upload result with URL and public_id
 */
const uploadBuffer = async (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadTimeout = setTimeout(() => {
            reject(new Error("Upload timed out. Server might be experiencing high load or connection issues."));
        }, options.timeout || 60000);
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            folder: options.folder || "hr-applications",
            resource_type: options.resource_type || "auto",
            public_id: options.public_id,
            use_filename: options.use_filename ?? true,
            unique_filename: options.unique_filename ?? false,
            timeout: options.timeout || 60000,
        }, (error, result) => {
            clearTimeout(uploadTimeout);
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
        uploadStream.on("error", (error) => {
            clearTimeout(uploadTimeout);
            reject(new Error(`Upload stream error: ${error.message}`));
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadBuffer = uploadBuffer;
/**
 * Upload base64 image to Cloudinary
 * @param base64Image - Base64 encoded image string
 * @param options - Upload options
 * @returns Upload result
 */
const uploadBase64 = async (base64Image, options = {}) => {
    try {
        const result = await cloudinary_1.default.uploader.upload(base64Image, {
            folder: options.folder || "hr-applications",
            resource_type: options.resource_type || "image",
            timeout: options.timeout || 60000,
        });
        return result;
    }
    catch (error) {
        console.error("Base64 upload error:", error);
        throw error;
    }
};
exports.uploadBase64 = uploadBase64;
/**
 * Get Cloudinary resource details
 * @param publicId - The public ID of the resource
 * @returns Resource details
 */
const getResourceDetails = async (publicId) => {
    try {
        const result = await cloudinary_1.default.api.resource(publicId);
        return result;
    }
    catch (error) {
        console.error("Error fetching resource details:", error);
        throw error;
    }
};
exports.getResourceDetails = getResourceDetails;
/**
 * List resources in a folder
 * @param folderPath - The folder path
 * @param options - List options
 * @returns List of resources
 */
const listResources = async (folderPath, options = {}) => {
    try {
        const result = await cloudinary_1.default.api.resources({
            type: "upload",
            prefix: folderPath,
            max_results: options.max_results || 100,
            resource_type: options.resource_type || "image",
        });
        return result;
    }
    catch (error) {
        console.error("Error listing resources:", error);
        throw error;
    }
};
exports.listResources = listResources;
//# sourceMappingURL=cloudinary.js.map