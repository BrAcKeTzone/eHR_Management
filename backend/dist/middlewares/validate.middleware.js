"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const validate = (schema, property = "body") => (req, res, next) => {
    const dataToValidate = req[property];
    const { value, error } = schema.validate(dataToValidate);
    if (error) {
        const errorMessage = error.details
            .map((details) => details.message)
            .join(", ");
        return next(new ApiError_1.default(400, errorMessage));
    }
    req[property] = value;
    return next();
};
exports.default = validate;
//# sourceMappingURL=validate.middleware.js.map