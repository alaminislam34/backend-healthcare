import { Router } from "express";
import { UserControllers } from "./user.controller";

const router = Router();

router.post("/create-doctor", UserControllers.createDoctor);


export const UserRoutes = router;
