import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const updateDoctorZodSchema = z.object({
  doctor: z.object({
    name: z
      .string("Name is required, must be a string")
      .min(10, "too short name")
      .max(100, "too long name")
      .optional(),
    profilePhoto: z.string("Profile photo is required").optional(),
    contactNumber: z
      .string("Contact number is required")
      .min(11, "Number must be at least 11 digits")
      .max(14, "Number must be at most 14 digits")
      .optional(),
    address: z.string("Address is required").optional(),
    experience: z
      .number("Experience is required")
      .nonnegative("Experience must be a non-negative number")
      .optional(),
    appointmentFee: z
      .number("Appointment fee is required")
      .nonnegative("Appointment fee must be a non-negative number")
      .optional(),
    qualification: z.string("Qualification is required").optional(),
    designation: z.string("Designation is required").optional(),
  }),
});
