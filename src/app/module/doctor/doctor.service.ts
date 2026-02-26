import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctorPayload } from "./doctor.interface";
import { UserStatus } from "../../../generated/prisma/enums";

const getAllDoctors = async () => {
  try {
    const result = await prisma.doctor.findMany({
      where: {
        isDeleted: false,
      },
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
      where: { id, isDeleted: false },
      include: {
        user: true,
        specialties: {
          include: {
            specialty: true,
          },
        },
        appointments: {
          include: {
            patient: true,
            schedule: true,
            prescription: true,
          },
        },
        doctorSchedules: {
          include: {
            schedule: true,
          },
        },
        reviews: true,
      },
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
    const isDoctorExists = await prisma.doctor.findUnique({
      where: { id },
    });
    if (!isDoctorExists) {
      throw new AppError(status.NOT_FOUND, "Doctor not found");
    }
    if (isDoctorExists.isDeleted) {
      throw new AppError(status.GONE, "Doctor is deleted");
    }

    const { doctor: DoctorData, specialties } = payload;
    await prisma.$transaction(async (tx) => {
      if (DoctorData) {
        await tx.doctor.update({
          where: { id },
          data: {
            ...DoctorData,
          },
        });
      }
      if (specialties && specialties.length > 0) {
        for (const specialty of specialties) {
          const { specialtyId, shouldDelete } = specialty;
          if (shouldDelete) {
            await tx.doctorSpecialty.delete({
              where: {
                doctorId_specialtyId: {
                  doctorId: id,
                  specialtyId,
                },
              },
            });
          } else {
            await tx.doctorSpecialty.upsert({
              where: {
                doctorId_specialtyId: {
                  doctorId: id,

                  specialtyId,
                },
              },
              create: {
                doctorId: id,
                specialtyId,
              },
              update: {},
            });
          }
        }
      }
    });

    const doctor = await getDoctorById(id);
    return doctor;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteDoctorById = async (id: string) => {
  const isDoctorExists = await prisma.doctor.findUnique({
    where: { id },
  });
  if (!isDoctorExists) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }
  await prisma.$transaction(async (tx) => {
    await tx.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: isDoctorExists.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: isDoctorExists.userId },
    });

    await tx.doctorSpecialty.deleteMany({
      where: { doctorId: id },
    });
  });

  return { message: "Doctor deleted successfully" };
};

export const DoctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctorById,
  deleteDoctorById,
};
