import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductsTable } from "@/components/admin/products-table";
import type { ProductListItem } from "@/lib/admin/products";

const item: ProductListItem = {
  id: "prod-1",
  title: "Solar Panel 400W",
  status: "draft",
  updatedAt: "2026-07-01T10:00:00.000Z",
};

describe("ProductsTable", () => {
  it("shows the unavailable notice instead of a table when data couldn't be loaded", () => {
    render(<ProductsTable result={{ status: "unavailable" }} />);
    expect(screen.getByRole("status")).toHaveTextContent(/unavailable/i);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows a genuine empty-state message for zero products, not a fake row", () => {
    render(<ProductsTable result={{ status: "ok", data: [] }} />);
    expect(screen.getByText(/no products yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders column headers, row data, and both actions", () => {
    render(<ProductsTable result={{ status: "ok", data: [item] }} />);

    expect(screen.getByRole("columnheader", { name: "Product name" })).toBeInTheDocument();
    expect(screen.getByText("Solar Panel 400W")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute(
      "href",
      "/admin/products/prod-1/edit",
    );
    expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();
  });

  it("shows Unpublish for an already-published product", () => {
    render(<ProductsTable result={{ status: "ok", data: [{ ...item, status: "published" }] }} />);
    expect(screen.getByRole("button", { name: /unpublish/i })).toBeInTheDocument();
  });
});
