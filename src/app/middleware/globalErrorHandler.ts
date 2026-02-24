import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import z from "zod";
import status from "http-status";
import { handleZodError } from "../errorHelpers/handleZodError";
import { TErrorSources } from "../interfaces/zodError";
import AppError from "../errorHelpers/AppError";

const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.error("Global Error Handler:", err);
  }

  let ErrorSource: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "An unexpected error occurred!";
  let stack: string | undefined = undefined;

  if (err instanceof z.ZodError) {
    const simplifiedErrors = handleZodError(err);
    statusCode = simplifiedErrors.statusCode as number;
    message = simplifiedErrors.message;
    ErrorSource = [...simplifiedErrors.errorSource];
    stack = err.stack;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    ErrorSource.push({
      path: "",
      message: err.message,
    });
  } else if (err instanceof Error) {
    message = err.message;
    statusCode = status.INTERNAL_SERVER_ERROR;
    stack = err.stack;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorSource: ErrorSource,
    stack: envVars.NODE_ENV === "development" ? stack : undefined,
    error: envVars.NODE_ENV === "development" ? err : undefined,
  });
};

export default globalErrorHandler;
