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

  try {
    const data = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    console.log(data.user.emailVerified);
    if (!data.user.emailVerified) {
      throw new AppError(
        status.FORBIDDEN,
        "Email not verified. Please verify your email to login.",
      );
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
    throw new AppError(status.FORBIDDEN, error.message || error.body?.message);
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
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
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

  const userId = session?.user.id;

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

    if (session.user.needPasswordChange) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          needPasswordChange: false,
        },
      });
    }

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

const logoutUser = async (sessionToken: string) => {
  if (!sessionToken) {
    throw new AppError(
      status.BAD_REQUEST,
      "No session exists. User is already logged out.",
    );
  }
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });
  return result;
};

const logoutFromAllDevices = async (sessionToken: string) => {
  if (!sessionToken) {
    throw new AppError(
      status.BAD_REQUEST,
      "No session exists. User is already logged out.",
    );
  }

  const currentSession = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  if (!currentSession) {
    throw new AppError(
      status.BAD_REQUEST,
      "No session exists. User is already logged out.",
    );
  }

  const removeSessions = await prisma.session.deleteMany({
    where: { userId: currentSession.userId, NOT: { token: sessionToken } },
  });

  return removeSessions;
};

const verifyEmail = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email: email,
      otp: otp,
    },
  });

  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: { email: email },
      data: {
        emailVerified: true,
      },
    });
  }
};

const forgotPassword = async (email: string) => {
  const isUserExists = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (isUserExists.emailVerified === false) {
    throw new AppError(
      status.FORBIDDEN,
      "Email not verified. Please verify your email to reset password.",
    );
  }

  if (
    isUserExists.status === UserStatus.BLOCKED ||
    isUserExists.status === UserStatus.DELETED
  ) {
    throw new AppError(status.FORBIDDEN, "Unauthorized access.");
  }

  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email: email,
    },
  });
};

const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const isUserExists = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await auth.api.resetPasswordEmailOTP({
    body: {
      email: email,
      otp: otp,
      password: newPassword,
    },
  });

  await prisma.session.deleteMany({
    where: { userId: isUserExists.id },
  });
};

const googleLoginSuccess = async (session: Record<string, any>) => {
  const isPatientExists = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  if (!isPatientExists) {
    await prisma.patient.create({
      data: {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    emailVerified: session.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    emailVerified: session.user.emailVerified,
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthServices = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  logoutFromAllDevices,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLoginSuccess,
};
