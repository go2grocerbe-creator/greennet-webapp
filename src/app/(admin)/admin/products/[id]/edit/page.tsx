import Link from "next/link";
import { notFound } from "next/navigation";

import { DataUnavailableNotice } from "@/components/admin/data-state-notice";
import { ProductForm } from "@/components/admin/product-form";
import { updateProductAction } from "@/lib/admin/product-actions";
import { getProduct } from "@/lib/admin/products";
import { getServerProductsDataSource } from "@/lib/admin/products-data-source";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const ds = await getServerProductsDataSource();
  const result = await getProduct(ds, id);

  if (result.status === "unavailable") {
    return (
      <DataUnavailableNotice
        className="m-6"
        message="Product data is unavailable right now. This usually means Supabase isn't configured in this environment yet — see docs/architecture.md."
      />
    );
  }

  if (!result.data) {
    notFound();
  }

  const product = result.data;

  return (
    <div className="p-6">
      <Link
        href="/admin/products"
        className="text-muted-foreground text-sm underline underline-offset-2"
      >
        ← Back to products
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Edit product</h1>
      <div className="mt-6">
        <ProductForm
          action={updateProductAction}
          productId={product.id}
          submitLabel="Save changes"
          defaultValues={{
            title: product.title,
            summary: product.summary,
            description: product.description,
            image: product.image,
            sortOrder: product.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
