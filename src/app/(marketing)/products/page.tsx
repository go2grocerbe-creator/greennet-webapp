import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { listProductsForPublic } from "@/lib/admin/products";
import { getServerProductsDataSource } from "@/lib/admin/products-data-source";

export const metadata: Metadata = {
  title: "Products",
  description: "Solar products offered by GreenNet Energy.",
  alternates: { canonical: "/products" },
};

/**
 * Reuses the admin Products data layer (src/lib/admin/products.ts) —
 * `listProductsForPublic` calls the exact same `ProductsDataSource.list()`
 * method the admin table uses; RLS (`products_public_read_published`)
 * is what actually restricts an anonymous visitor to published rows, not
 * a separate query — see docs/decision-log.md ADR-013.
 */
export default async function ProductsPage() {
  const ds = await getServerProductsDataSource();
  const result = await listProductsForPublic(ds);

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="What we offer"
        title="Products"
        description="Solar products available from GreenNet Energy."
      />
      <div className="mt-10">
        {result.status === "unavailable" ? (
          <p className="border-border text-muted-foreground rounded-lg border p-6 text-sm">
            Products are unavailable right now. Please check back soon.
          </p>
        ) : result.data.length === 0 ? (
          <p className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
            No products are published yet. Please check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((product) => (
              <article key={product.id} className="border-border rounded-lg border p-6">
                {product.image && (
                  // Staff-supplied arbitrary URLs, not Supabase Storage assets —
                  // next/image would require an unbounded remotePatterns allowlist
                  // for no real benefit here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.title}
                    className="mb-4 aspect-video w-full rounded-md object-cover"
                  />
                )}
                <h2 className="font-heading text-lg font-semibold">{product.title}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{product.summary}</p>
                <p className="mt-3 text-sm whitespace-pre-wrap">{product.description}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
