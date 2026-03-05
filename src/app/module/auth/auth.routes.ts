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
router.post("/logout", AuthControllers.logoutUser);
router.post("/logout-all-devices", AuthControllers.logoutFromAllDevices);
router.post("/verify-email", AuthControllers.verifyEmail);
router.post("/forgot-password", AuthControllers.forgotPassword);
router.post("/reset-password", AuthControllers.resetPassword);

export const AuthRoutes = router;
