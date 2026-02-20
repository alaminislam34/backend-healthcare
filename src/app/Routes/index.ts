import { Router } from "express";
import { SpecialtyRoutes } from "../module/Specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.routes";
import { UserRoutes } from "../module/user/user.routes";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/specialties", SpecialtyRoutes);
router.use("/users", UserRoutes);

export const IndexRoutes = router;
