import { Router } from "express";
import { UserControllers } from "./user.controller";
import { zodValidation } from "../../middleware/zodValidationHandler";
import { createDoctorZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/create-doctor",
  zodValidation(createDoctorZodSchema),
  UserControllers.createDoctor,
);
router.post(
  "/create-admin",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserControllers.createAdmin,
);

export const UserRoutes = router;
