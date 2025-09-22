import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import ApiError from "../utils/ApiError";

const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { value, error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(", ");
      return next(new ApiError(400, errorMessage));
    }
    Object.assign(req, value);
    return next();
  };

export default validate;
