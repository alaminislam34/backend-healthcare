import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";

import { IRequestUser } from "../../interfaces/request.interface";
import { envVars } from "../../../config/env";
import { jwtUtils } from "../../utils/jwt";

interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
}
interface ILoginPayload {
  email: string;
  password: string;
}

const registerPatient = async (payLoad: IRegisterPayload) => {
  const { email, password, name } = payLoad;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });
  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register patient");
  }

  try {
    const patient = await prisma.patient.create({
      data: {
        userId: data.user.id,
        name: payLoad.name,
        email: payLoad.email,
      },
    });

    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      emailVerified: data.user.emailVerified,
    });

    return { ...data, patient, accessToken, refreshToken };
  } catch (error) {
    console.log("Transaction error:", error);
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw error;
  }
};

const loginUser = async (payload: ILoginPayload) => {
  const { email, password } = payload;
  if (!email || !password) {
    throw new AppError(status.BAD_REQUEST, "Email and password are required");
  }
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(
      status.FORBIDDEN,
      "Your account is blocked. Please contact support.",
    );
  }
  if (data.user.status === UserStatus.DELETED) {
    throw new AppError(
      status.GONE,
      "Your account is deleted. Please contact support.",
    );
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    emailVerified: data.user.emailVerified,
  });

  return {
    accessToken,
    refreshToken,
    ...data,
  };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      patient: {
        include: {
          appointments: true,
          medicalReports: true,
          patientHealthData: true,
          prescriptions: true,
          reviews: true,
          user: true,
        },
      },
      doctor: {
        include: {
          appointments: true,
          doctorSchedules: true,
          specialties: true,
          prescriptions: true,
          reviews: true,
          user: true,
        },
      },
      admin: true,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return isUserExists;
};

export const AuthServices = {
  registerPatient,
  loginUser,
  getMe,
};
