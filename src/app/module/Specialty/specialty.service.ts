import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
  try {
    const result = await prisma.specialty.create({
      data: payload,
    });
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllSpecialties = async (): Promise<Specialty[]> => {
  try {
    const result = await prisma.specialty.findMany();
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const SpecialtyService = {
  createSpecialty,
  getAllSpecialties,
};
