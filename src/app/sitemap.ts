import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config";

/**
 * Static Phase 1 routes only. Once services/products/projects are
 * CMS-backed and published, this should be extended to include their
 * slugs — see docs/data-model.md.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return siteConfig.nav.map((item) => ({
    url: new URL(item.href, siteUrl).toString(),
    lastModified: new Date(),
  }));
}
