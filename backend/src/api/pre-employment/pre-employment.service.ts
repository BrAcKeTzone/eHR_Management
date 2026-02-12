import prisma from "../../configs/prisma";
import type { Prisma } from "@prisma/client";

export const getPreEmployment = async (userId: number) => {
  return await prisma.preEmploymentRequirement.findUnique({
    where: { userId },
  });
};

export const upsertPreEmployment = async (
  userId: number,
  data: Prisma.PreEmploymentRequirementCreateInput,
) => {
  return await prisma.preEmploymentRequirement.upsert({
    where: { userId },
    update: data,
    create: { ...data, userId },
  });
};

export const deletePreEmployment = async (userId: number) => {
  return await prisma.preEmploymentRequirement.delete({
    where: { userId },
  });
};
