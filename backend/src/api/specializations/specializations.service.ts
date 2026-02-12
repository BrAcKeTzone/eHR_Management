import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";

const prisma = new PrismaClient();

export const getAllSpecializations = async () => {
  return await prisma.specialization.findMany({
    orderBy: { name: "asc" },
  });
};

export const createSpecialization = async (name: string) => {
  const existingSpec = await prisma.specialization.findUnique({
    where: { name },
  });

  if (existingSpec) {
    throw new ApiError(400, "Specialization already exists");
  }

  return await prisma.specialization.create({
    data: { name },
  });
};

export const deleteSpecialization = async (id: number) => {
  const existingSpec = await prisma.specialization.findUnique({
    where: { id },
  });

  if (!existingSpec) {
    throw new ApiError(404, "Specialization not found");
  }

  return await prisma.specialization.delete({
    where: { id },
  });
};
