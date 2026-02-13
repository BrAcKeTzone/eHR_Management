"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePreEmployment = exports.upsertPreEmployment = exports.getPreEmployment = void 0;
const prisma_1 = __importDefault(require("../../configs/prisma"));
const getPreEmployment = async (userId) => {
    return await prisma_1.default.preEmploymentRequirement.findUnique({
        where: { userId },
    });
};
exports.getPreEmployment = getPreEmployment;
const upsertPreEmployment = async (userId, data) => {
    return await prisma_1.default.preEmploymentRequirement.upsert({
        where: { userId },
        update: data,
        create: { ...data, userId },
    });
};
exports.upsertPreEmployment = upsertPreEmployment;
const deletePreEmployment = async (userId) => {
    return await prisma_1.default.preEmploymentRequirement.delete({
        where: { userId },
    });
};
exports.deletePreEmployment = deletePreEmployment;
//# sourceMappingURL=pre-employment.service.js.map