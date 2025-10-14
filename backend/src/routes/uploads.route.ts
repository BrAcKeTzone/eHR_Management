import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware";
import { requireHR } from "../middlewares/rbac.middleware";
import {
  uploadFile,
  uploadMultipleFiles,
  uploadBase64Image,
  deleteFile,
  getFileInfo,
} from "../api/uploads/upload.controller";

const router = express.Router();

// Set up multer for memory storage with increased limits
const storage = multer.memoryStorage();

// Create multer instance with error handling
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    fieldSize: 15 * 1024 * 1024, // 15MB max field size for better base64 handling
  },
  fileFilter: (req, file, cb) => {
    // Allowed mime types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type ${file.mimetype} is not allowed. Only JPG, PNG, PDF, DOC, DOCX, and TXT files are permitted.`
        )
      );
    }
  },
});

// Error handler for multer errors
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File too large. Maximum size is 10MB.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 10 files.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err.message && err.message.includes("File type")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

// Upload routes with type parameter:
// /api/uploads?type=application - For application documents
// /api/uploads?type=id - For ID documents
// /api/uploads?type=document - For general documents
// /api/uploads?type=profile - For profile images

// Public route for single file upload (can be used during application submission)
router.post("/", upload.single("file"), handleMulterError, uploadFile);

// Route for base64 image upload
router.post("/base64", express.json({ limit: "15mb" }), uploadBase64Image);

// Protected routes - require authentication
router.use(authMiddleware);

// Route for multiple file uploads - authenticated users
// Used for application documents (applicants) or bulk uploads (HR)
router.post(
  "/multiple",
  upload.array("files", 10), // Allow up to 10 files
  handleMulterError,
  uploadMultipleFiles
);

// Route for document uploads with specific type
router.post(
  "/document",
  upload.array("files", 10),
  handleMulterError,
  (req: any, res: any, next: any) => {
    // Force type to be 'document'
    req.query.type = req.query.type || "document";
    next();
  },
  uploadMultipleFiles
);

// Route for application-specific uploads
router.post(
  "/application",
  upload.array("files", 10),
  handleMulterError,
  (req: any, res: any, next: any) => {
    // Force type to be 'application'
    req.query.type = "application";
    next();
  },
  uploadMultipleFiles
);

// Only authenticated users can delete their files
// HR can delete any files
router.delete("/:publicId", deleteFile);

// Get file information
router.get("/:publicId/info", getFileInfo);

export default router;
