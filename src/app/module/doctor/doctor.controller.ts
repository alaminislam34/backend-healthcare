import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { DoctorService } from "./doctor.service";
import status from "http-status";

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const doctors = await DoctorService.getAllDoctors();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctors fetched successfully",
    data: doctors,
  });
});

const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doctor = await DoctorService.getDoctorById(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor fetched successfully",
    data: doctor,
  });
});

const updateDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const updatedDoctor = await DoctorService.updateDoctorById(
    id as string,
    payload as IUpdateDoctorPayload,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor updated successfully",
    data: updatedDoctor,
  });
});

const deleteDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await DoctorService.deleteDoctorById(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor deleted successfully",
  });
});

export const DoctorController = {
  getAllDoctors,
  getDoctorById,
  updateDoctorById,
  deleteDoctorById,
};
