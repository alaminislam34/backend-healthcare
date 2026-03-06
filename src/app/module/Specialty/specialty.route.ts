import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { multerUPload } from "../../../config/multer.config";

const router = Router();

router.post(
  "/",
//   checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  multerUPload.single("file"),
  SpecialtyController.createSpecialty,
);
router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SpecialtyController.getAllSpecialties,
);

export const SpecialtyRoutes = router;
