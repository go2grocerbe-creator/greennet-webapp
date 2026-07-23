import { z } from "zod";

/**
 * Single shared source for the admin Projects form — same shape and
 * reasoning as src/lib/validation/service.ts.
 */
export const projectInputSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(200),
  location: z.string().trim().min(1, "Enter a location.").max(200),
  summary: z.string().trim().min(1, "Enter a short description.").max(500),
  description: z.string().trim().min(1, "Enter a full description.").max(5000),
  completionDate: z.preprocess(
    (value) => (value === "" || value === undefined || value === null ? undefined : value),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
      .optional(),
  ),
  coverImage: z
    .string()
    .trim()
    .min(1)
    .max(1000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  sortOrder: z.preprocess(
    (value) => (value === "" || value === undefined || value === null ? undefined : value),
    z.coerce
      .number()
      .int("Display order must be a whole number.")
      .min(0, "Display order can't be negative.")
      .optional(),
  ),
});

export type ProjectInput = z.input<typeof projectInputSchema>;
export type ProjectValues = z.output<typeof projectInputSchema>;
