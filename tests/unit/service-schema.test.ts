import { describe, expect, it } from "vitest";

import { serviceInputSchema } from "@/lib/validation/service";

const validPayload = {
  title: "Solar Installation",
  summary: "Full installation service for homes and businesses.",
  body: "We design, install, and commission complete solar systems.",
  icon: "",
  sortOrder: "",
};

describe("serviceInputSchema", () => {
  it("accepts a valid payload and normalizes empty optional fields to undefined", () => {
    const result = serviceInputSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.icon).toBeUndefined();
      expect(result.data.sortOrder).toBeUndefined();
    }
  });

  it("rejects a missing title", () => {
    const result = serviceInputSchema.safeParse({ ...validPayload, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing short description", () => {
    const result = serviceInputSchema.safeParse({ ...validPayload, summary: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing full description", () => {
    const result = serviceInputSchema.safeParse({ ...validPayload, body: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a provided icon and sort order", () => {
    const result = serviceInputSchema.safeParse({ ...validPayload, icon: "sun", sortOrder: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.icon).toBe("sun");
      expect(result.data.sortOrder).toBe(3);
    }
  });

  it("rejects a negative display order", () => {
    const result = serviceInputSchema.safeParse({ ...validPayload, sortOrder: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-numeric display order", () => {
    const result = serviceInputSchema.safeParse({ ...validPayload, sortOrder: "not-a-number" });
    expect(result.success).toBe(false);
  });

  it("rejects a title that exceeds the maximum length", () => {
    const result = serviceInputSchema.safeParse({ ...validPayload, title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });
});
