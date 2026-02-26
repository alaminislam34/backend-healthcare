import { Router } from "express";
import { AdminController } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { zodValidation } from "../../middleware/zodValidationHandler";
import { updateAdminZodSchema } from "./admin.validation";

const router = Router();

router.get("/", checkAuth(UserRole.SUPER_ADMIN), AdminController.getAllAdmins);
router.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.getAdminById,
);
router.patch(
  "/:id",
  zodValidation(updateAdminZodSchema),
  checkAuth(UserRole.SUPER_ADMIN),
  AdminController.updateAdmin,
);
router.delete(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN),
  AdminController.deleteAdmin,
);

export const AdminRoutes = router;
