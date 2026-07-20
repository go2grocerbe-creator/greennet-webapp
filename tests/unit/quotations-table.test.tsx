import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuotationsTable } from "@/components/admin/quotations-table";
import type { QuotationListItem } from "@/lib/admin/quotations";

const item: QuotationListItem = {
  id: "row-1",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+234 906 312 1247",
  interestedSolution: "installation",
  status: "new",
  createdAt: "2026-07-01T10:00:00.000Z",
};

describe("QuotationsTable", () => {
  it("shows the unavailable notice instead of a table when data couldn't be loaded", () => {
    render(<QuotationsTable result={{ status: "unavailable" }} />);

    expect(screen.getByRole("status")).toHaveTextContent(/unavailable/i);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows a genuine empty-state message for zero rows, not a fake row", () => {
    render(<QuotationsTable result={{ status: "ok", data: [] }} />);

    expect(screen.getByText(/no quotation requests yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders column headers and row data", () => {
    render(<QuotationsTable result={{ status: "ok", data: [item] }} />);

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Email" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Interested solution" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Submitted" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Solar installation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view/i })).toHaveAttribute(
      "href",
      "/admin/quotations/row-1",
    );
  });
});
