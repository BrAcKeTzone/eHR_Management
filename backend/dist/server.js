"use strict";
// This file sets up and starts the Express server for the BCFI HR Application System - Teacher Application Process
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const server = app_1.default.listen(PORT, () => {
    console.log(`BCFI HR Application System running on http://localhost:${PORT}`);
});
// Set server timeout for long-running operations like file uploads
server.setTimeout(300000); // 5 minutes
server.keepAliveTimeout = 305000; // Slightly longer than request timeout
//# sourceMappingURL=server.js.map