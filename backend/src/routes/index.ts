import express from "express";
const router = express.Router();

import authRouter from "../api/auth/auth.route";
import userRouter from "../api/users/users.route";
import applicationRouter from "../api/applications/applications.route";
import scoringRouter from "../api/scoring/scoring.route";

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/applications", applicationRouter);
router.use("/scoring", scoringRouter);

export default router;
