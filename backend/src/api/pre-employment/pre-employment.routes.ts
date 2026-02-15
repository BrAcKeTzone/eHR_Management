import { Router } from "express";
import {
  getPreEmploymentHandler,
  getPreEmploymentByUserIdHandler,
  upsertPreEmploymentHandler,
  deletePreEmploymentHandler,
} from "./pre-employment.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import { requireHR } from "../../middlewares/rbac.middleware";
import upload from "../../middlewares/upload.middleware";

const router = Router();

router.use(authMiddleware);

const uploadFields = upload.fields([
  { name: "photo2x2", maxCount: 1 },
  { name: "coe", maxCount: 1 },
  { name: "marriageContract", maxCount: 1 },
  { name: "prcLicense", maxCount: 1 },
  { name: "civilService", maxCount: 1 },
  { name: "mastersUnits", maxCount: 1 },
  { name: "car", maxCount: 1 },
  { name: "tor", maxCount: 1 },
  { name: "certificates", maxCount: 1 },
  { name: "tesdaFiles", maxCount: 10 },
]);

router.get("/", getPreEmploymentHandler);
router.get("/:userId", requireHR, getPreEmploymentByUserIdHandler);

const setUploadFolder = (req: any, res: any, next: any) => {
  req.uploadFolder = "hr-applications/pre-employment";
  next();
};

router.post("/", setUploadFolder, uploadFields, upsertPreEmploymentHandler);
router.delete("/", deletePreEmploymentHandler);

export default router;
