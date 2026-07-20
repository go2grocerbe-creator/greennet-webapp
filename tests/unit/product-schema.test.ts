import { describe, expect, it } from "vitest";

import { productInputSchema } from "@/lib/validation/product";

const validPayload = {
  title: "Solar Panel 400W",
  summary: "High-efficiency monocrystalline panel.",
  description: "Full specifications and installation notes for this panel.",
  image: "",
  sortOrder: "",
};

describe("productInputSchema", () => {
  it("accepts a valid payload and normalizes empty optional fields to undefined", () => {
    const result = productInputSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.image).toBeUndefined();
      expect(result.data.sortOrder).toBeUndefined();
    }
  });

  it("rejects a missing title", () => {
    expect(productInputSchema.safeParse({ ...validPayload, title: "" }).success).toBe(false);
  });

  it("rejects a missing short description", () => {
    expect(productInputSchema.safeParse({ ...validPayload, summary: "" }).success).toBe(false);
  });

  it("rejects a missing full description", () => {
    expect(productInputSchema.safeParse({ ...validPayload, description: "" }).success).toBe(false);
  });

  it("accepts a provided image and sort order", () => {
    const result = productInputSchema.safeParse({
      ...validPayload,
      image: "https://example.com/panel.jpg",
      sortOrder: "2",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.image).toBe("https://example.com/panel.jpg");
      expect(result.data.sortOrder).toBe(2);
    }
  });

  it("rejects a negative display order", () => {
    expect(productInputSchema.safeParse({ ...validPayload, sortOrder: "-1" }).success).toBe(false);
  });
});
