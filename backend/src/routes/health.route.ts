import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Application is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
