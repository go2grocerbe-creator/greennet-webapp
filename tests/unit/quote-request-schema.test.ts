import { describe, expect, it } from "vitest";

import {
  HONEYPOT_FIELD_NAME,
  INTERESTED_SOLUTION_OPTIONS,
  isInterestedSolutionValue,
  quoteRequestSchema,
  quoteSubmissionSchema,
} from "@/lib/validation/quote-request";

const validPayload = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+234 906 312 1247",
  companyName: "",
  location: "Benin City",
  propertyType: "residential",
  interestedSolution: "installation",
  electricityUsage: "50000 naira/month",
  preferredContactMethod: "whatsapp",
  projectTimeline: "within_3_months",
  message: "I would like a quotation for my home rooftop.",
  privacyConsent: true,
};

describe("quoteRequestSchema", () => {
  it("accepts every documented interested-solution value", () => {
    for (const option of INTERESTED_SOLUTION_OPTIONS) {
      expect(
        quoteRequestSchema.safeParse({
          ...validPayload,
          interestedSolution: option.value,
        }).success,
      ).toBe(true);
      expect(isInterestedSolutionValue(option.value)).toBe(true);
    }
  });

  it("keeps the interested-solution values stable", () => {
    expect(INTERESTED_SOLUTION_OPTIONS.map((option) => option.value)).toEqual([
      "complete_solar_system",
      "site_assessment",
      "installation",
      "monitoring_maintenance",
      "products_equipment",
      "cabling_mounting",
      "ev_charging",
      "general_enquiry",
      "other",
    ]);
  });

  it("accepts a valid submission and trims/normalizes optional fields", () => {
    const result = quoteRequestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John Doe");
      expect(result.data.companyName).toBeUndefined();
    }
  });

  it("rejects an invalid email", () => {
    const result = quoteRequestSchema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects a phone number with invalid characters", () => {
    const result = quoteRequestSchema.safeParse({ ...validPayload, phone: "call-me-maybe" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone number that is too short", () => {
    const result = quoteRequestSchema.safeParse({ ...validPayload, phone: "123" });
    expect(result.success).toBe(false);
  });

  it("allows an empty phone (optional field)", () => {
    const result = quoteRequestSchema.safeParse({ ...validPayload, phone: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeUndefined();
    }
  });

  it("rejects a missing privacy consent", () => {
    const rest: Partial<typeof validPayload> = { ...validPayload };
    delete rest.privacyConsent;
    const result = quoteRequestSchema.safeParse(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.privacyConsent).toBeDefined();
    }
  });

  it("rejects privacy consent set to false", () => {
    const result = quoteRequestSchema.safeParse({ ...validPayload, privacyConsent: false });
    expect(result.success).toBe(false);
  });

  it("rejects a message that exceeds the maximum length", () => {
    const result = quoteRequestSchema.safeParse({
      ...validPayload,
      message: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message that is too short", () => {
    const result = quoteRequestSchema.safeParse({ ...validPayload, message: "hi" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid propertyType enum value", () => {
    const result = quoteRequestSchema.safeParse({ ...validPayload, propertyType: "castle" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid interestedSolution enum value", () => {
    const result = quoteRequestSchema.safeParse({
      ...validPayload,
      interestedSolution: "some-unapproved-service-name",
    });
    expect(result.success).toBe(false);
    expect(isInterestedSolutionValue("some-unapproved-service-name")).toBe(false);
  });
});

describe("quoteSubmissionSchema", () => {
  it("strips unexpected fields rather than trusting them", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validPayload,
      [HONEYPOT_FIELD_NAME]: "",
      turnstileToken: "token-123",
      role: "owner",
      isAdmin: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("role");
      expect(result.data).not.toHaveProperty("isAdmin");
    }
  });

  it("accepts a non-empty honeypot value at the schema level (rejection happens in the pipeline)", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validPayload,
      [HONEYPOT_FIELD_NAME]: "http://spam.example",
      turnstileToken: "token-123",
    });
    expect(result.success).toBe(true);
  });

  it("requires a turnstile token", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validPayload,
      [HONEYPOT_FIELD_NAME]: "",
      turnstileToken: "",
    });
    expect(result.success).toBe(false);
  });
});
