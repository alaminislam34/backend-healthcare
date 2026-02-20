import { Router } from "express";
import { AuthControllers } from "./auth.controller";

const router = Router();

router.post("/register", AuthControllers.registerPatient);
router.post("/login", AuthControllers.loginUser);

export const AuthRoutes = router;
