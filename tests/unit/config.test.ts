import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/config";

describe("siteConfig", () => {
  it("exposes the confirmed Phase 1 nav routes", () => {
    const hrefs = siteConfig.nav.map((item) => item.href);
    expect(hrefs).toEqual([
      "/",
      "/about",
      "/solar-solutions",
      "/products",
      "/projects",
      "/contact",
    ]);
  });

  it("carries only client-confirmed contact facts", () => {
    expect(siteConfig.contact.phone).toBe("+234 906 312 1247");
    expect(siteConfig.contact.email).toBe("oduwaogbeiwi@gmail.com");
  });
});
