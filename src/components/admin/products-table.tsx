import Link from "next/link";

import { formatDateTime } from "@/lib/admin/format";
import { setProductStatusAction } from "@/lib/admin/product-actions";
import type { DataResult, ProductListItem } from "@/lib/admin/products";

import { DataUnavailableNotice, EmptyNotice } from "./data-state-notice";
import { PublishStatusBadge } from "./publish-status-badge";
import { PublishStatusButton } from "./publish-status-button";

export function ProductsTable({ result }: { result: DataResult<ProductListItem[]> }) {
  if (result.status === "unavailable") {
    return (
      <DataUnavailableNotice message="Product data is unavailable right now. This usually means Supabase isn't configured in this environment yet — see docs/architecture.md." />
    );
  }

  if (result.data.length === 0) {
    return <EmptyNotice message="No products yet. Create the first one to get started." />;
  }

  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Product name
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Last updated
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((product) => (
            <tr key={product.id} className="border-border border-t">
              <td className="px-4 py-3">{product.title}</td>
              <td className="px-4 py-3">
                <PublishStatusBadge status={product.status} />
              </td>
              <td className="px-4 py-3">{formatDateTime(product.updatedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="focus-visible:ring-ring rounded underline underline-offset-2 outline-none focus-visible:ring-2"
                  >
                    Edit
                  </Link>
                  <PublishStatusButton
                    id={product.id}
                    currentStatus={product.status}
                    action={setProductStatusAction}
                    testId={`product-status-toggle-${product.id}`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
