import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";

import { IRequestUser } from "../../interfaces/request.interface";
import { envVars } from "../../../config/env";
import { jwtUtils } from "../../utils/jwt";
import {
  IChangePasswordPayload,
  ILoginPayload,
  IRegisterPayload,
} from "./auth.interface";

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
  try {
    const data = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    if (!data) {
      throw new AppError(status.BAD_REQUEST, "Invalid email or password");
    }
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
  } catch (error: any) {
    throw new AppError(status.BAD_REQUEST, "Invalid email or password");
  }
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

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionExists = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!isSessionExists) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );

  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const data = verifiedRefreshToken.data;

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.id,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.id,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    emailVerified: data.emailVerified,
  });

  const { token } = await prisma.session.update({
    where: { token: sessionToken },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    token,
  };
};

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });
  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }
  const { currentPassword, newPassword } = payload;

  try {
    const data = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: new Headers({
        Authorization: `Bearer ${sessionToken}`,
      }),
    });
    const newAccessToken = tokenUtils.getAccessToken({
      userId: session.user.id,
      role: session.user.role,
      name: session.user.name,
      email: session.user.email,
      status: session.user.status,
      emailVerified: session.user.emailVerified,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
      userId: session.user.id,
      role: session.user.role,
      name: session.user.name,
      email: session.user.email,
      status: session.user.status,
      emailVerified: session.user.emailVerified,
    });

    return {
      ...data,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error: any) {
    throw new AppError(
      status.BAD_REQUEST,
      error.message || error.body?.message || "Failed to change password",
    );
  }
};

export const AuthServices = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
};
