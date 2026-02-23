import { Router } from "express";
import { UserControllers } from "./user.controller";
import { zodValidation } from "../../middleware/zodValidationHandler";
import { createDoctorZodSchema } from "./user.validation";

const router = Router();

router.post(
  "/create-doctor",
  zodValidation(createDoctorZodSchema),
  UserControllers.createDoctor,
);

export const UserRoutes = router;
