import { describe, expect, it } from "vitest";

import { slugify, slugifyWithSuffix } from "@/lib/admin/slug";

describe("slugify", () => {
  it("lowercases and hyphenates a title", () => {
    expect(slugify("Solar Installation Services")).toBe("solar-installation-services");
  });

  it("strips punctuation and collapses repeated separators", () => {
    expect(slugify("Panels & Inverters!!  (Residential)")).toBe("panels-inverters-residential");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  -- Battery Storage -- ")).toBe("battery-storage");
  });
});

describe("slugifyWithSuffix", () => {
  it("appends a suffix to the base slug", () => {
    const result = slugifyWithSuffix("Solar Installation");
    expect(result.startsWith("solar-installation-")).toBe(true);
    expect(result.length).toBeGreaterThan("solar-installation-".length);
  });
});
