import { Request, Response } from "express";
import path from "path";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import {
  uploadBuffer,
  uploadBase64,
  deleteImage,
} from "../../utils/cloudinary";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    email: string;
  };
}

/**
 * Upload single file to Cloudinary with specified folder destination
 */
export const uploadFile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    // Determine the upload folder based on the request type
    const uploadType = (req.query.type as string) || "general";
    let folder = "hr-applications/applicants-attachments";
    let resourceType: "image" | "raw" | "auto" = "auto";

    // Set the appropriate folder based on upload type
    switch (uploadType) {
      case "application":
        folder = "hr-applications/applicants-attachments";
        resourceType = "auto";
        break;
      case "id":
        folder = "bcfi_hr/valid_ids";
        resourceType = "image";
        break;
      case "document":
        folder = "hr-applications/applicants-attachments";
        resourceType = "raw";
        break;
      case "profile":
        folder = "hr-applications/profile-pictures";
        resourceType = "image";
        break;
      default:
        folder = "bcfi_hr/general";
        resourceType = "auto";
    }

    console.log(`Uploading file to ${folder} as ${resourceType}`);

    // Get file extension
    const fileExt = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.originalname, fileExt);

    // Format filename
    const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const timestamp = Date.now();
    const publicId = `${dateStr}_${timestamp}_${baseName}`;

    // Upload file buffer to Cloudinary
    const result = await uploadBuffer(req.file.buffer, {
      folder,
      resource_type: resourceType,
      public_id: publicId,
      use_filename: true,
      unique_filename: false,
      timeout: 60000,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
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
        },
        "File uploaded successfully"
      )
    );
  }
);

/**
 * Upload multiple files to Cloudinary
 */
export const uploadMultipleFiles = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new ApiError(400, "No files uploaded");
    }

    // Determine the upload folder based on the request type
    const uploadType = (req.query.type as string) || "document";
    let folder = "hr-applications/applicants-attachments";
    let resourceType: "image" | "raw" | "auto" = "auto";

    switch (uploadType) {
      case "application":
        folder = "hr-applications/applicants-attachments";
        resourceType = "auto";
        break;
      case "document":
        folder = "hr-applications/applicants-attachments";
        resourceType = "raw";
        break;
      default:
        folder = "bcfi_hr/general";
        resourceType = "auto";
    }

    const dateStr = new Date().toISOString().split("T")[0];

    console.log(
      `Uploading ${req.files.length} files to ${folder} as ${resourceType}`
    );

    // Upload files sequentially to prevent overwhelming the server
    const uploadedFiles = [];
    const failedFiles = [];

    for (const file of req.files) {
      try {
        const fileExt = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, fileExt);
        const timestamp = Date.now();
        const publicId = `${dateStr}_${timestamp}_${baseName}`;

        const result = await uploadBuffer(file.buffer, {
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
      } catch (fileError: any) {
        console.error(`Error uploading file ${file.originalname}:`, fileError);
        failedFiles.push({
          originalname: file.originalname,
          error: fileError.message,
        });
      }
    }

    if (uploadedFiles.length === 0) {
      throw new ApiError(
        500,
        "All file uploads failed. Please try again with smaller files or check your connection."
      );
    }

    const message =
      uploadedFiles.length === req.files.length
        ? "All files uploaded successfully"
        : `${uploadedFiles.length} out of ${req.files.length} files uploaded successfully`;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          files: uploadedFiles,
          failed: failedFiles,
          uploadType,
          folder,
          partialSuccess: uploadedFiles.length < req.files.length,
        },
        message
      )
    );
  }
);

/**
 * Upload base64 encoded image to Cloudinary
 */
export const uploadBase64Image = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { image } = req.body;

    if (!image) {
      throw new ApiError(400, "No image data provided");
    }

    // Determine the upload folder based on the request type
    const uploadType = (req.query.type as string) || "profile";
    let folder = "hr-applications/profile-pictures";

    switch (uploadType) {
      case "profile":
        folder = "hr-applications/profile-pictures";
        break;
      case "id":
        folder = "bcfi_hr/valid_ids";
        break;
      default:
        folder = "bcfi_hr/general";
    }

    const result = await uploadBase64(image, {
      folder,
      resource_type: "image",
      timeout: 60000,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          url: result.secure_url,
          public_id: result.public_id,
          uploadType,
          folder,
        },
        "Image uploaded successfully"
      )
    );
  }
);

/**
 * Delete file from Cloudinary
 */
export const deleteFile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { publicId } = req.params;

    if (!publicId) {
      throw new ApiError(400, "No public ID provided");
    }

    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await deleteImage(decodedPublicId);

    if (result.result === "ok") {
      res
        .status(200)
        .json(new ApiResponse(200, result, "File deleted successfully"));
    } else {
      throw new ApiError(400, "Failed to delete file");
    }
  }
);

/**
 * Get file information from Cloudinary
 */
export const getFileInfo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { publicId } = req.params;

    if (!publicId) {
      throw new ApiError(400, "No public ID provided");
    }

    // Note: This would require implementing getResourceDetails in cloudinary utils
    res
      .status(200)
      .json(
        new ApiResponse(200, { publicId }, "File info retrieved successfully")
      );
  }
);
