import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "@/lib/admin/product-actions";

export default function NewProductPage() {
  return (
    <div className="p-6">
      <Link
        href="/admin/products"
        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
      >
        ← Back to products
      </Link>
      <h1 className="font-heading mt-4 text-2xl font-semibold tracking-tight">Create product</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        New products are created as drafts — publish from the products list when ready.
      </p>
      <div className="border-border bg-card shadow-brand-xs mt-6 max-w-2xl rounded-xl border p-6 sm:p-8">
        <ProductForm action={createProductAction} submitLabel="Create product" />
      </div>
    </div>
  );
}
