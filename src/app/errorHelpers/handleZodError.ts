import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/zodError";

export const handleZodError = (err: z.ZodError): TErrorResponse => {
  const statusCode = status.BAD_REQUEST;
  let message = "Zod validation error!";
  let errorSources: TErrorSources[] = [];

  err.issues.forEach((issue) => {
    errorSources.push({
      path:
        issue.path.length > 1 ? issue.path.join(".") : issue.path[0].toString(),
      message: issue.message,
    });
  });

  return {
    success: false,
    statusCode: statusCode,
    message: message,
    errorSource: errorSources,
  };
};
