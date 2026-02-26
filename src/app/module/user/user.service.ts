import status from "http-status";
import { Specialty, UserRole } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateAdmin, ICreateDoctorPayload } from "./user.interface";

const createDoctor = async (payload: ICreateDoctorPayload) => {
  const specialties: Specialty[] = [];

  for (const specialtyId of payload.specialties) {
    const specialty = await prisma.specialty.findUnique({
      where: { id: specialtyId },
    });

    if (!specialty) {
      throw new AppError(
        status.NOT_FOUND,
        `Specialty with id ${specialtyId} not found`,
      );
    }
    specialties.push(specialty);
  }

  const userExists = await prisma.user.findUnique({
    where: { email: payload.doctor.email },
  });

  if (userExists) {
    throw new AppError(
      status.CONFLICT,
      `User with email ${payload.doctor.email} already exists`,
    );
  }

  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.doctor.email,
      password: payload.password,
      role: UserRole.DOCTOR,
      name: payload.doctor.name,
      needPasswordChange: true,
    },
  });

  try {
    const isRegistrationNumberExists = await prisma.doctor.findUnique({
      where: { registrationNumber: payload.doctor.registrationNumber },
    });
    if (isRegistrationNumberExists) {
      console.log("Doctor with Registration number exists");
      throw new AppError(status.CONFLICT, `Invalid registration number.`);
    }
    const isEmailExists = await prisma.doctor.findUnique({
      where: { email: payload.doctor.email },
    });
    if (isEmailExists) {
      throw new AppError(
        status.CONFLICT,
        `Doctor with email ${payload.doctor.email} already exists`,
      );
    }
    const result = await prisma.$transaction(async (tx) => {
      const doctor = await tx.doctor.create({
        data: {
          userId: userData.user.id,
          ...payload.doctor,
        },
      });

      const doctorSpecialties = specialties.map((specialty) => {
        return {
          doctorId: doctor.id,
          specialtyId: specialty.id,
        };
      });

      await tx.doctorSpecialty.createMany({
        data: doctorSpecialties,
      });

      const doctorData = await tx.doctor.findUnique({
        where: { id: doctor.id },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          gender: true,
          appointmentFee: true,
          qualification: true,
          designation: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              status: true,
              emailVerified: true,
              needPasswordChange: true,
              image: true,
              isDeleted: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          specialties: {
            select: {
              specialty: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
      return doctorData;
    });
    return result;
  } catch (error) {
    console.log("Transaction error:", error);

    await prisma.user.delete({
      where: { id: userData.user.id },
    });
    throw error;
  }
};

const createAdmin = async (payload: ICreateAdmin) => {
  const userExists = await prisma.user.findUnique({
    where: { email: payload.admin.email },
  });
  if (userExists) {
    throw new AppError(status.CONFLICT, `This email is already exists`);
  }
  const userData = await auth.api.signUpEmail({
    body: {
      name: payload.admin.name,
      email: payload.admin.email,
      password: payload.password,
      role: UserRole.ADMIN,
    },
  });

  return userData.user;
};

export const UserService = {
  createDoctor,
  createAdmin,
};
