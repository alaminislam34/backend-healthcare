import z from "zod";

const createSpecialtyValidation = z.object({
  title: z.string("Name is required"),
  description: z.string("Description is required").optional(),
});

export const zodValidationSchema = {
  createSpecialtyValidation,
};
