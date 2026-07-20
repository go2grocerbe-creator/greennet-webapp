import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "@/lib/admin/product-actions";

export default function NewProductPage() {
  return (
    <div className="p-6">
      <Link
        href="/admin/products"
        className="text-muted-foreground text-sm underline underline-offset-2"
      >
        ← Back to products
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Create product</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        New products are created as drafts — publish from the products list when ready.
      </p>
      <div className="mt-6">
        <ProductForm action={createProductAction} submitLabel="Create product" />
      </div>
    </div>
  );
}
