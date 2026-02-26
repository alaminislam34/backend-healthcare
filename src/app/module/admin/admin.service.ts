import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateAdminPayload } from "./admin.interface";
import { UserStatus } from "../../../generated/prisma/browser";

const getAllAdmins = async () => {
  const result = await prisma.admin.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      user: true,
    },
  });
  return result;
};

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
    include: {
      user: true,
    },
  });
  return admin;
};

const updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });
  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  const { admin } = payload;
  const updateAdmin = await prisma.admin.update({
    where: { id },
    data: {
      ...admin,
    },
  });
  return updateAdmin;
};

const deleteAdmin = async (id: string) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });
  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: isAdminExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: isAdminExist.userId },
    });

    await tx.account.deleteMany({
      where: { userId: isAdminExist.userId },
    });

    const admin = await getAdminById(id);
    return admin;
  });
  return result;
};

export const AdminService = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
