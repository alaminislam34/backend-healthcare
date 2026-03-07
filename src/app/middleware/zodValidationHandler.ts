import { NextFunction, Request, Response } from "express";
import z from "zod";

export const zodValidation = (zodObject: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(req.file)
    if (req.body.data){
      req.body = JSON.parse(req.body.data);
    }
    const validationResult = zodObject.safeParse(req.body);

    if (!validationResult.success) {
      next(validationResult.error);
    }
    req.body = validationResult.data;
    next();
  };
};
