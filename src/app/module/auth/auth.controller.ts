import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthServices } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthServices.registerPatient(payload);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Patient registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthServices.loginUser(payload);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

export const AuthControllers = {
  registerPatient,
  loginUser,
};
