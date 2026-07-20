import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/admin/products-table";
import { listProducts } from "@/lib/admin/products";
import { getServerProductsDataSource } from "@/lib/admin/products-data-source";

export default async function AdminProductsPage() {
  const ds = await getServerProductsDataSource();
  const result = await listProducts(ds);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage the Products page content. Only published products will appear on the public
            site.
          </p>
        </div>
        <Button render={<Link href="/admin/products/new" />} nativeButton={false}>
          Create product
        </Button>
      </div>
      <div className="mt-6">
        <ProductsTable result={result} />
      </div>
    </div>
  );
}
