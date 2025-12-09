"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../configs/prisma"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError_1.default(401, "Access token is required");
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new ApiError_1.default(500, "JWT secret not configured");
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });
        if (!user) {
            throw new ApiError_1.default(401, "Invalid token - user not found");
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new ApiError_1.default(401, "Invalid token"));
        }
        else {
            next(error);
        }
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map