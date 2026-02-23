import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const router = Router();
router.get("/", DoctorController.getAllDoctors);
router.get("/:id", DoctorController.getDoctorById);
router.put("/:id", DoctorController.updateDoctorById);
router.patch("/:id", DoctorController.deleteDoctorById);

export const DoctorRoutes = router;
