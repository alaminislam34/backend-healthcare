import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { multerUPload } from "../../../config/multer.config";
import { zodValidation } from "../../middleware/zodValidationHandler";
import { zodValidationSchema } from "./specialty.validation";
import { SpecialtyService } from "./specialty.service";

const router = Router();

router.post(
  "/",
  //   checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  multerUPload.single("file"),
  zodValidation(zodValidationSchema.createSpecialtyValidation),
  SpecialtyController.createSpecialty,
);
router.get(
  "/",
  // checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SpecialtyController.getAllSpecialties,
);

export const SpecialtyRoutes = router;
