import type { Metadata } from "next";

import { PublicDataState } from "@/components/marketing/public-data-state";
import { SolarPageHero } from "@/components/marketing/solar-page-hero";
import { Container } from "@/components/ui/container";
import { listProductsForPublic } from "@/lib/admin/products";
import { getServerProductsDataSource } from "@/lib/admin/products-data-source";

export const metadata: Metadata = {
  title: "Products",
  description: "Solar products offered by GreenNet Energy.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const ds = await getServerProductsDataSource();
  const result = await listProductsForPublic(ds);

  return (
    <>
      <SolarPageHero
        tone="golden"
        eyebrow="Products"
        time="17:21"
        title="Objects that hold the day."
        description="Published solar products available from GreenNet Energy."
      />
      <Container className="public-catalogue">
        {result.status === "unavailable" ? (
          <PublicDataState kind="products" status="unavailable" />
        ) : result.data.length === 0 ? (
          <PublicDataState kind="products" status="empty" />
        ) : (
          <div className="product-exhibition">
            {result.data.map((product, index) => (
              <article key={product.id} className="product-exhibition__item">
                <div className="product-exhibition__visual">
                  {product.image ? (
                    // Staff-supplied URL; never presented as GreenNet project photography.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image} alt={product.title} loading="lazy" />
                  ) : (
                    <div className="product-exhibition__object" aria-hidden="true">
                      <i />
                      <i />
                      <span />
                    </div>
                  )}
                  <p aria-hidden="true">{String(index + 1).padStart(2, "0")}</p>
                </div>
                <div className="product-exhibition__content">
                  <p>Published product</p>
                  <h2>{product.title}</h2>
                  <p className="product-exhibition__summary">{product.summary}</p>
                  <p className="product-exhibition__body">{product.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
