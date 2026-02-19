"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.uploadSingle = exports.injectApplicantInfo = exports.uploadApplicationDocuments = exports.uploadDocuments = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../configs/cloudinary"));
// Helper function to format filename
const formatFileName = (documentType, lastName, firstName, timestamp, extension) => {
    // Clean names - remove special characters and spaces
    const cleanLastName = lastName.replace(/[^a-zA-Z0-9]/g, "");
    const cleanFirstName = firstName.replace(/[^a-zA-Z0-9]/g, "");
    // Format: DocumentType_LastNameFirstName_DateTime.extension
    const dateTime = new Date(timestamp).toISOString().replace(/[:.]/g, "-");
    return `${documentType}_${cleanLastName}${cleanFirstName}_${dateTime}.${extension}`;
};
// Helper function to determine document type from fieldname or filename
const getDocumentType = (req, fileIndex, fieldname, originalname) => {
    // First, try to get type from documentTypes metadata
    try {
        if (req.body.documentTypes) {
            const types = JSON.parse(req.body.documentTypes);
            if (Array.isArray(types) && types[fileIndex]) {
                const type = types[fileIndex];
                // Convert type to proper case
                if (type === "resume")
                    return "Resume";
                if (type === "applicationLetter")
                    return "ApplicationLetter";
                if (type === "diploma")
                    return "Diploma";
                if (type === "transcript")
                    return "Transcript";
                if (type === "pds")
                    return "PDS";
                if (type === "prc")
                    return "PRCLicense";
                if (type === "certificates")
                    return "Certificate";
                return type.charAt(0).toUpperCase() + type.slice(1);
            }
        }
    }
    catch (e) {
        console.log("Could not parse documentTypes, falling back to filename");
    }
    // Check if fieldname contains type info
    if (fieldname.includes("resume"))
        return "Resume";
    if (fieldname.includes("applicationLetter") || fieldname.includes("letter"))
        return "ApplicationLetter";
    // Pre-employment mappings
    if (fieldname === "photo2x2")
        return "IDPicture";
    if (fieldname === "coe")
        return "COE";
    if (fieldname === "marriageContract")
        return "MarriageContract";
    if (fieldname === "prcLicense")
        return "PRCLicense";
    if (fieldname === "civilService")
        return "CivilServiceEligibility";
    if (fieldname === "mastersUnits")
        return "MastersUnits";
    if (fieldname === "car")
        return "CAR";
    if (fieldname === "tor")
        return "TOR";
    if (fieldname === "certificates")
        return "Certificate";
    if (fieldname === "tesdaFiles")
        return "TESDACertificate";
    // Extract from filename if available
    const lowerName = originalname.toLowerCase();
    if (lowerName.includes("resume") || lowerName.includes("cv"))
        return "Resume";
    if (lowerName.includes("application") && lowerName.includes("letter"))
        return "ApplicationLetter";
    if (lowerName.includes("diploma"))
        return "Diploma";
    if (lowerName.includes("transcript") || lowerName.includes("tor"))
        return "Transcript";
    if (lowerName.includes("pds"))
        return "PDS";
    if (lowerName.includes("prc") || lowerName.includes("license"))
        return "PRCLicense";
    if (lowerName.includes("certificate"))
        return "Certificate";
    // Default to Document if type cannot be determined
    return "Document";
};
// Configure Cloudinary storage
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => {
        const timestamp = Date.now();
        // Get applicant information from request body or user
        const firstName = req.body.applicantFirstName || req.user?.firstName || "Unknown";
        const lastName = req.body.applicantLastName || req.user?.lastName || "Unknown";
        // Initialize file index counter if not present
        if (!req.fileIndex) {
            req.fileIndex = 0;
        }
        // Determine document type
        const documentType = getDocumentType(req, req.fileIndex, file.fieldname, file.originalname);
        // Increment file index for next file
        req.fileIndex++;
        // Get file extension
        const extension = file.originalname.split(".").pop() || "pdf";
        // Generate formatted filename
        let formattedName = formatFileName(documentType, lastName, firstName, timestamp, extension);
        // Append index for multiple files (like TESDA) to prevent potential overwrites
        if (documentType === "TESDACertificate" ||
            Array.isArray(req.files) ||
            (req.files &&
                req.files[file.fieldname] &&
                req.files[file.fieldname].length > 1)) {
            formattedName += `_${req.fileIndex}`;
        }
        // Determine resource type based on mimetype
        let resourceType = "raw";
        if (file.mimetype.startsWith("image/") ||
            file.mimetype === "application/pdf") {
            resourceType = "image";
        }
        else if (file.mimetype.startsWith("video/")) {
            resourceType = "video";
        }
        console.log("Uploading file:", {
            originalname: file.originalname,
            formattedName: formattedName,
            documentType: documentType,
            applicant: `${firstName} ${lastName}`,
            mimetype: file.mimetype,
            resourceType: resourceType,
            folder: req.uploadFolder || "hr-applications/applicants-attachments",
        });
        return {
            folder: req.uploadFolder || "hr-applications/applicants-attachments", // Folder in Cloudinary for applicant documents
            public_id: formattedName,
            resource_type: resourceType, // Use determined resource type instead of auto
            // Don't specify allowed_formats - let Cloudinary handle all formats for the resource type
        };
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
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
});
// Middleware for multiple file uploads (up to 10 files)
exports.uploadDocuments = upload.array("documents", 10);
// File filter specifically for applicant application documents (PDF, JPG/JPEG, PNG only)
const applicationAllowedTypes = ["application/pdf"];
const applicationFileFilter = (req, file, cb) => {
    if (applicationAllowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type ${file.mimetype} is not allowed. Only PDF files are permitted.`), false);
    }
};
const applicationUpload = (0, multer_1.default)({
    storage: storage,
    fileFilter: applicationFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
});
exports.uploadApplicationDocuments = applicationUpload.array("documents", 10);
// Middleware to inject applicant name into request body before file upload
const injectApplicantInfo = async (req, res, next) => {
    try {
        // If user info is available from auth middleware, add it to body
        if (req.user) {
            const { PrismaClient } = await Promise.resolve().then(() => __importStar(require("@prisma/client")));
            const prisma = new PrismaClient();
            try {
                const user = await prisma.user.findUnique({
                    where: { id: req.user.id },
                    select: { firstName: true, lastName: true },
                });
                if (user) {
                    req.body.applicantFirstName = user.firstName;
                    req.body.applicantLastName = user.lastName;
                    console.log("Injected applicant info:", user.firstName, user.lastName);
                }
                await prisma.$disconnect();
            }
            catch (error) {
                console.error("Error fetching user info for file naming:", error);
                await prisma.$disconnect();
            }
        }
        next();
    }
    catch (error) {
        console.error("Error in injectApplicantInfo middleware:", error);
        next(); // Continue even if this fails
    }
};
exports.injectApplicantInfo = injectApplicantInfo;
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