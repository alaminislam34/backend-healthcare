import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorZodSchema = z.object({
  password: z.string("Password is required").min(6, "too short password"),
  doctor: z.object({
    name: z
      .string("Name is required, must be a string")
      .min(10, "too short name")
      .max(100, "too long name"),
    email: z.email("Invalid email address"),
    registrationNumber: z.string("Registration number is required"),
    profilePhoto: z.string("Profile photo is required"),
    contactNumber: z
      .string("Contact number is required")
      .min(11, "Number must be at least 11 digits")
      .max(14, "Number must be at most 14 digits"),
    address: z.string("Address is required"),
    experience: z
      .number("Experience is required")
      .nonnegative("Experience must be a non-negative number"),
    appointmentFee: z
      .number("Appointment fee is required")
      .nonnegative("Appointment fee must be a non-negative number"),
    gender: z.enum(
      [Gender.MALE, Gender.FEMALE],
      "Gender must be either 'MALE' or 'FEMALE'",
    ),
    qualification: z.string("Qualification is required"),
    designation: z.string("Designation is required"),
  }),
  specialties: z.array(z.uuid("Specialty ID must be a valid UUID")),
});

const createAdminValidationSchema = z.object({
  body: z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    admin: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.email("Invalid email format"),
      profilePhoto: z.url("Invalid URL format"),
      contactNumber: z.string().min(1, "Contact number is required"),
    }),
  }),
});
