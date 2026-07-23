import { describe, expect, it } from "vitest";

import { projectInputSchema } from "@/lib/validation/project";

const validPayload = {
  title: "Residential Rooftop Install",
  location: "Benin City",
  summary: "10kW rooftop system for a family home.",
  description: "Full details of equipment and installation timeline.",
  completionDate: "",
  coverImage: "",
  sortOrder: "",
};

describe("projectInputSchema", () => {
  it("accepts a valid payload and normalizes empty optional fields to undefined", () => {
    const result = projectInputSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completionDate).toBeUndefined();
      expect(result.data.coverImage).toBeUndefined();
      expect(result.data.sortOrder).toBeUndefined();
    }
  });

  it("rejects a missing title", () => {
    expect(projectInputSchema.safeParse({ ...validPayload, title: "" }).success).toBe(false);
  });

  it("rejects a missing location", () => {
    expect(projectInputSchema.safeParse({ ...validPayload, location: "" }).success).toBe(false);
  });

  it("rejects a missing short description", () => {
    expect(projectInputSchema.safeParse({ ...validPayload, summary: "" }).success).toBe(false);
  });

  it("rejects a missing full description", () => {
    expect(projectInputSchema.safeParse({ ...validPayload, description: "" }).success).toBe(false);
  });

  it("accepts a valid completion date", () => {
    const result = projectInputSchema.safeParse({ ...validPayload, completionDate: "2026-03-15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completionDate).toBe("2026-03-15");
    }
  });

  it("rejects a malformed completion date", () => {
    expect(
      projectInputSchema.safeParse({ ...validPayload, completionDate: "15/03/2026" }).success,
    ).toBe(false);
  });
});
