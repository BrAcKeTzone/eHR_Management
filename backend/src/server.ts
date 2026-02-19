// This file sets up and starts the Express server for the BCFI HR Application System - Teacher Application Process

import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`BCFI HR Application System running on http://localhost:${PORT}`);
});

// Set server timeout for long-running operations like file uploads
server.setTimeout(300000); // 5 minutes
server.keepAliveTimeout = 305000; // Slightly longer than request timeout
