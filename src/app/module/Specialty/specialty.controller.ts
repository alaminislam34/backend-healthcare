import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { SpecialtyService } from "./specialty.service";
import { sendResponse } from "../../shared/sendResponse";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const specialty = await SpecialtyService.createSpecialty(payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Specialty created successfully",
    data: specialty,
  });
});

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
  const specialties = await SpecialtyService.getAllSpecialties();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specialties retrieved successfully",
    data: specialties,
  });
});

export const SpecialtyController = {
  createSpecialty,
  getAllSpecialties,
};
