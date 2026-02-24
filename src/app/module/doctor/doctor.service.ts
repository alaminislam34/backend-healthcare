import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const getAllDoctors = async () => {
  try {
    const result = await prisma.doctor.findMany({
      include: {
        user: true,
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getDoctorById = async (id: string) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });
    if (!doctor) {
      throw new AppError(status.NOT_FOUND, "Doctor not found");
    }
    return doctor;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateDoctorById = async (id: string, payload: IUpdateDoctorPayload) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });
    if (!doctor) {
      throw new AppError(status.NOT_FOUND, "Doctor not found");
    }
    if (doctor.isDeleted) {
      throw new AppError(status.GONE, "Doctor is deleted");
    }
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: payload,
    });

    return updatedDoctor;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteDoctorById = async (id: string) => {
  try {
    const deletedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
    if (!deletedDoctor) {
      throw new AppError(status.NOT_FOUND, "Doctor not found");
    }
    return deletedDoctor;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const DoctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctorById,
  deleteDoctorById,
};
