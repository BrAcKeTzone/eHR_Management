import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import ApiError from "../utils/ApiError";

const validate =
  (schema: Joi.ObjectSchema, property: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[property];
    const { value, error } = schema.validate(dataToValidate);
    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(", ");
      return next(new ApiError(400, errorMessage));
    }
    req[property] = value;
    return next();
  };

export default validate;
