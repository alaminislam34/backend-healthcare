import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", AuthControllers.registerPatient);
router.post("/login", AuthControllers.loginUser);
router.get(
  "/me",
  checkAuth(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.PATIENT,
    UserRole.SUPER_ADMIN,
  ),
  AuthControllers.getMe,
);
router.post("/refresh-token", AuthControllers.getNewToken);
router.post("/change-password", AuthControllers.changePassword);

export const AuthRoutes = router;
