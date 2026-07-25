import { z } from "zod";

/**
 * Single shared source for the Contact/Quotation form — used by both the
 * client (React Hook Form resolver, usability only) and the server
 * (authoritative). See docs/security-model.md "Quotation form submission
 * path": client validation improves usability, server validation is
 * authoritative and re-runs independently.
 *
 * Field list is ASSUMPTION-grade pending client confirmation — see
 * docs/requirements-register.md §5 and docs/decision-log.md ADR-010.
 */

// Neutral, non-branded categories only — the draft `services` content is
// unapproved, so this list intentionally does not reuse those names. See
// docs/content-register.md.
export const INTERESTED_SOLUTION_OPTIONS = [
  { value: "complete_solar_system", label: "Complete solar system" },
  { value: "site_assessment", label: "Site assessment" },
  { value: "installation", label: "Solar installation" },
  { value: "monitoring_maintenance", label: "Monitoring & maintenance" },
  { value: "products_equipment", label: "Products & equipment" },
  { value: "cabling_mounting", label: "Cabling & mounting" },
  { value: "ev_charging", label: "EV charging" },
  { value: "general_enquiry", label: "General enquiry" },
  { value: "other", label: "Other" },
] as const;

export type InterestedSolutionValue = (typeof INTERESTED_SOLUTION_OPTIONS)[number]["value"];

export function isInterestedSolutionValue(value: unknown): value is InterestedSolutionValue {
  return (
    typeof value === "string" &&
    INTERESTED_SOLUTION_OPTIONS.some((option) => option.value === value)
  );
}

export const PROPERTY_TYPE_OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
] as const;

export const CONTACT_METHOD_OPTIONS = [
  { value: "phone", label: "Phone call" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

export const PROJECT_TIMELINE_OPTIONS = [
  { value: "immediately", label: "As soon as possible" },
  { value: "within_3_months", label: "Within 3 months" },
  { value: "within_6_months", label: "Within 6 months" },
  { value: "researching", label: "Just researching for now" },
] as const;

const interestedSolutionValues = INTERESTED_SOLUTION_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];
const propertyTypeValues = PROPERTY_TYPE_OPTIONS.map((o) => o.value) as [string, ...string[]];
const contactMethodValues = CONTACT_METHOD_OPTIONS.map((o) => o.value) as [string, ...string[]];
const projectTimelineValues = PROJECT_TIMELINE_OPTIONS.map((o) => o.value) as [string, ...string[]];

// Digits, spaces, +, -, (, ) only — permissive on format (international
// numbers, local conventions) but rejects anything that isn't a phone
// number shape.
const PHONE_PATTERN = /^[0-9+\-() ]+$/;

const trimmedString = (max: number) => z.string().trim().max(max);

export const quoteRequestSchema = z.object({
  name: trimmedString(100).min(2, "Enter your full name."),
  email: trimmedString(254).email("Enter a valid email address."),
  phone: z
    .union([
      trimmedString(30)
        .min(7, "Enter a valid phone number.")
        .regex(PHONE_PATTERN, "Phone number contains invalid characters."),
      z.literal(""),
    ])
    .optional()
    .transform((v) => (v ? v : undefined)),
  companyName: trimmedString(200)
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  location: trimmedString(200)
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  propertyType: z
    .enum(propertyTypeValues)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  interestedSolution: z
    .enum(interestedSolutionValues)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  electricityUsage: trimmedString(200)
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  preferredContactMethod: z
    .enum(contactMethodValues)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  projectTimeline: z
    .enum(projectTimelineValues)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  message: trimmedString(2000).min(10, "Tell us a little more (at least 10 characters)."),
  privacyConsent: z.literal(true, {
    error: "You must accept the privacy notice to submit this form.",
  }),
});

export type QuoteRequestInput = z.input<typeof quoteRequestSchema>;
export type QuoteRequestValues = z.output<typeof quoteRequestSchema>;

/** Accessibly-hidden trap field name — must arrive empty from a real user. */
export const HONEYPOT_FIELD_NAME = "hp_field";

/**
 * Full raw submission shape validated server-side, before the honeypot
 * and Turnstile checks run. Unknown keys are stripped (Zod's default),
 * not trusted — see docs/security-model.md.
 */
export const quoteSubmissionSchema = quoteRequestSchema.extend({
  [HONEYPOT_FIELD_NAME]: z.string().optional(),
  turnstileToken: z.string().min(1, "Verification token missing."),
});

export type QuoteSubmissionInput = z.input<typeof quoteSubmissionSchema>;
