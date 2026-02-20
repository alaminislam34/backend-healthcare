import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

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
    throw new Error("Failed to register patient");
  }

  try {
    const patient = await prisma.patient.create({
      data: {
        userId: data.user.id,
        name: payLoad.name,
        email: payLoad.email,
      },
    });

    return { ...data, patient };
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
    throw new Error("Email and password are required");
  }
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new Error("Your account is blocked. Please contact support.");
  }
  if (data.user.status === UserStatus.DELETED) {
    throw new Error("Your account is deleted. Please contact support.");
  }

  return data;
};

export const AuthServices = {
  registerPatient,
  loginUser,
};
