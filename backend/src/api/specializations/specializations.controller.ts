import { Request, Response } from "express";
import * as specializationService from "./specializations.service";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";

export const getSpecializations = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await specializationService.getAllSpecializations();
    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Specializations retrieved successfully"),
      );
  },
);

export const createSpecialization = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new ApiError(400, "Valid specialization name is required");
    }

    const result = await specializationService.createSpecialization(
      name.trim(),
    );
    res
      .status(201)
      .json(
        new ApiResponse(201, result, "Specialization created successfully"),
      );
  },
);

export const deleteSpecialization = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const specId = parseInt(id);

    if (isNaN(specId)) {
      throw new ApiError(400, "Invalid specialization ID");
    }

    await specializationService.deleteSpecialization(specId);
    res
      .status(200)
      .json(new ApiResponse(200, null, "Specialization deleted successfully"));
  },
);
