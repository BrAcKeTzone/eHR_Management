import express from "express";
const router = express.Router();

import authRouter from "../api/auth/auth.route";
import userRouter from "../api/users/users.route";
import applicationRouter from "../api/applications/applications.route";
import scoringRouter from "../api/scoring/scoring.route";
import reportsRouter from "../api/reports/reports.route";
import uploadsRouter from "./uploads.route";

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/applications", applicationRouter);
router.use("/scoring", scoringRouter);
router.use("/reports", reportsRouter);
router.use("/uploads", uploadsRouter);

export default router;
