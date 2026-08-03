import type { Metadata } from "next";

import { SolarPageHero } from "@/components/marketing/solar-page-hero";
import { SolutionCta } from "@/components/marketing/solution-cta";
import { Container } from "@/components/ui/container";
import { listProductsForPublic } from "@/lib/admin/products";
import { getServerProductsDataSource } from "@/lib/admin/products-data-source";
import { PRODUCT_CATEGORIES } from "@/lib/content/public-content";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Solar product categories and approved published product information from GreenNet Energy.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const ds = await getServerProductsDataSource();
  const result = await listProductsForPublic(ds);
  const products = result.status === "ok" ? result.data : [];

  return (
    <>
      <SolarPageHero
        tone="golden"
        eyebrow="Products"
        time="17:21"
        title="Objects that hold the day."
        description="Explore the equipment categories that can form part of a compatible solar and energy system."
      />

      <Container className="solutions-editorial">
        <section className="solutions-section" aria-labelledby="product-categories-title">
          <div className="solutions-section__intro">
            <p>Product categories</p>
            <h2 id="product-categories-title">Compatibility before catalogue volume.</h2>
            <span>
              Product selection follows the site, operating requirement, and wider system design.
              Brands, specifications, availability, warranties, and commercial terms are confirmed
              for the approved quotation rather than assumed on this page.
            </span>
          </div>

          <ol className="solution-pillar-ledger">
            {PRODUCT_CATEGORIES.map((category, index) => (
              <li key={category.title}>
                <div className="solution-pillar-ledger__index">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i aria-hidden="true" />
                </div>
                <div className="solution-pillar-ledger__body">
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <ul>
                    {category.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {products.length > 0 && (
          <section className="published-services" aria-labelledby="published-products-title">
            <div className="solutions-section__intro">
              <p>Published catalogue</p>
              <h2 id="published-products-title">Approved product records.</h2>
              <span>
                These records contain only products GreenNet has explicitly published. Public
                pricing remains absent until the client approves it.
              </span>
            </div>

            <div className="product-exhibition">
              {products.map((product, index) => (
                <article key={product.id} className="product-exhibition__item">
                  <div className="product-exhibition__visual">
                    <div className="product-exhibition__object" aria-hidden="true">
                      <i />
                      <i />
                      <span />
                    </div>
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
          </section>
        )}
      </Container>

      <Container className="solutions-cta-wrap">
        <SolutionCta />
      </Container>
    </>
  );
}
