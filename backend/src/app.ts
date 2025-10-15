import express, { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes/index";
import { AuthenticationError } from "./utils/errors";
import ApiError from "./utils/ApiError";

const app: Express = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof AuthenticationError) {
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

export default app;
