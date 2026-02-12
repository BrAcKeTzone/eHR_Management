import express from "express";
import {
  getSpecializations,
  createSpecialization,
  deleteSpecialization,
} from "./specializations.controller";
import authenticate from "../../middlewares/auth.middleware";
import { requireHR } from "../../middlewares/rbac.middleware";

const router = express.Router();

router.get("/", authenticate, getSpecializations);
router.post("/", authenticate, requireHR, createSpecialization);
router.delete("/:id", authenticate, requireHR, deleteSpecialization);

export default router;
