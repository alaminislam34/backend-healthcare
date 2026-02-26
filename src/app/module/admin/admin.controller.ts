import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AdminService } from "./admin.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IUpdateAdminPayload } from "./admin.interface";

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const admins = await AdminService.getAllAdmins();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admins fetched successfully",
    data: admins,
  });
});

const getAdminById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const admin = await AdminService.getAdminById(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin fetched successfully",
    data: admin,
  });
});

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const updatedAdmin = await AdminService.updateAdmin(
    id as string,
    payload as IUpdateAdminPayload,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin updated successfully",
    data: updatedAdmin,
  });
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AdminService.deleteAdmin(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin deleted successfully",
  });
});

export const AdminController = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
