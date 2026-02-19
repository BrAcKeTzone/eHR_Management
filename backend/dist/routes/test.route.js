"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = express_1.default.Router();
/**
 * GET /api/test
 * Simple test endpoint to verify API is running
 */
router.get("/", (0, asyncHandler_1.default)(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running successfully!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
}));
/**
 * GET /api/test/health
 * Health check endpoint with more detailed information
 */
router.get("/health", (0, asyncHandler_1.default)(async (req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy",
        message: "API health check passed",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
    });
}));
/**
 * POST /api/test/echo
 * Echo endpoint to test request body/query parameters
 */
router.post("/echo", (0, asyncHandler_1.default)(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Echo response",
        receivedData: {
            body: req.body,
            query: req.query,
            headers: {
                contentType: req.headers["content-type"],
                userAgent: req.headers["user-agent"],
            },
        },
        timestamp: new Date().toISOString(),
    });
}));
/**
 * GET /api/test/config
 * Configuration check endpoint (BE CAREFUL WITH SENSITIVE DATA)
 */
router.get("/config", (0, asyncHandler_1.default)(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Current configuration",
        config: {
            environment: process.env.NODE_ENV,
            apiPort: process.env.PORT || 5000,
            databaseUrl: process.env.DATABASE_URL
                ? "✓ Configured"
                : "✗ Not configured",
            corsEnabled: true,
            timestamp: new Date().toISOString(),
        },
    });
}));
exports.default = router;
//# sourceMappingURL=test.route.js.map