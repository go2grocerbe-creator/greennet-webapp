import { z } from "zod";

/**
 * Single shared source for the admin Services form — client validation
 * (usability only) and server validation (authoritative) both use this,
 * same pattern as src/lib/validation/quote-request.ts.
 */
export const serviceInputSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(200),
  summary: z.string().trim().min(1, "Enter a short description.").max(500),
  body: z.string().trim().min(1, "Enter a full description.").max(5000),
  icon: z
    .string()
    .trim()
    .min(1)
    .max(100)
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

export type ServiceInput = z.input<typeof serviceInputSchema>;
export type ServiceValues = z.output<typeof serviceInputSchema>;
