"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpecialization = exports.createSpecialization = exports.getAllSpecializations = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const prisma = new client_1.PrismaClient();
const getAllSpecializations = async () => {
    return await prisma.specialization.findMany({
        orderBy: { name: "asc" },
    });
};
exports.getAllSpecializations = getAllSpecializations;
const createSpecialization = async (name) => {
    const existingSpec = await prisma.specialization.findUnique({
        where: { name },
    });
    if (existingSpec) {
        throw new ApiError_1.default(400, "Specialization already exists");
    }
    return await prisma.specialization.create({
        data: { name },
    });
};
exports.createSpecialization = createSpecialization;
const deleteSpecialization = async (id) => {
    const existingSpec = await prisma.specialization.findUnique({
        where: { id },
    });
    if (!existingSpec) {
        throw new ApiError_1.default(404, "Specialization not found");
    }
    return await prisma.specialization.delete({
        where: { id },
    });
};
exports.deleteSpecialization = deleteSpecialization;
//# sourceMappingURL=specializations.service.js.map