import { Request, Response, NextFunction } from "express";
import {
  getPreEmployment,
  upsertPreEmployment,
} from "./pre-employment.service";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import asyncHandler from "../../utils/asyncHandler";

export const getPreEmploymentHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const requirements = await getPreEmployment(userId);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          requirements,
          "Pre-employment requirements retrieved successfully",
        ),
      );
  },
);

export const upsertPreEmploymentHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const body = req.body;
    const files = (req as any).files;

    // Build data object from body and files
    const data: any = {
      sss: body.sss,
      philhealth: body.philhealth,
      tin: body.tin,
      pagibig: body.pagibig,
    };

    // Handle single file uploads
    const fileFields = [
      "photo2x2",
      "coe",
      "marriageContract",
      "prcLicense",
      "civilService",
      "mastersUnits",
      "car",
      "tor",
      "otherCert",
    ];

    fileFields.forEach((field) => {
      if (files && files[field] && files[field][0]) {
        data[field] = files[field][0].path; // Cloudinary URL
      }
    });

    // Handle multiple file uploads (TESDA)
    // If files are uploaded, we store them.
    // Ideally, we should fetch existing ones and append if needed, but for now let's overwrite or handle new ones.
    // If the frontend handles "appending" by re-sending previous files (not possible with file input unless using DataTransfer or similar),
    // usually we append new files to the list in DB.

    if (files && files["tesdaFiles"]) {
      // Get existing to append?
      const existing = await getPreEmployment(userId);
      let existingTesda: string[] = [];
      if (existing && existing.tesdaCerts) {
        try {
          existingTesda = JSON.parse(existing.tesdaCerts);
        } catch (e) {
          existingTesda = [];
        }
      }

      const newTesda = files["tesdaFiles"].map((f: any) => f.path);
      // Combine (or just use new if that's the desired behavior. Let's append for now as default safe behavior for multi-upload)
      // Wait, if user wants to remove, they can't.
      // For a simple implementation, let's assume this endpoint usage adds files.
      // A robust solution needs separate delete endpoint or full replacement logic.
      // Let's implement APPEND for Tesda.
      const combined = [...existingTesda, ...newTesda];
      data.tesdaCerts = JSON.stringify(combined);
    }

    // If no tesda files uploaded, we don't touch the field in `data` so it stays as is in DB (via upsert logic, wait upsert replaces if created).
    // Actually prisma update only updates fields present in `data`.

    const result = await upsertPreEmployment(userId, data);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Pre-employment requirements saved successfully",
        ),
      );
  },
);
