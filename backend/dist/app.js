"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const errors_1 = require("./utils/errors");
const ApiError_1 = __importDefault(require("./utils/ApiError"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api", index_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("=== ERROR CAUGHT ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    // Check if it's a Cloudinary error
    if (err.http_code || err.storageErrors) {
        console.error("Cloudinary error details:", {
            http_code: err.http_code,
            message: err.message,
            storageErrors: err.storageErrors,
        });
        return res.status(err.http_code || 500).json({
            success: false,
            message: `File upload error: ${err.message}`,
        });
    }
    if (err instanceof ApiError_1.default) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
    }
    if (err instanceof errors_1.AuthenticationError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
            error: err.message,
            stack: err.stack,
        }),
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map