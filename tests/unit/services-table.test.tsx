import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ServicesTable } from "@/components/admin/services-table";
import type { ServiceListItem } from "@/lib/admin/services";

const item: ServiceListItem = {
  id: "svc-1",
  title: "Solar Installation",
  status: "draft",
  updatedAt: "2026-07-01T10:00:00.000Z",
};

describe("ServicesTable", () => {
  it("shows the unavailable notice instead of a table when data couldn't be loaded", () => {
    render(<ServicesTable result={{ status: "unavailable" }} />);

    expect(screen.getByRole("status")).toHaveTextContent(/unavailable/i);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows a genuine empty-state message for zero services, not a fake row", () => {
    render(<ServicesTable result={{ status: "ok", data: [] }} />);

    expect(screen.getByText(/no services yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders column headers, row data, and both actions", () => {
    render(<ServicesTable result={{ status: "ok", data: [item] }} />);

    expect(screen.getByRole("columnheader", { name: "Service name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Last updated" })).toBeInTheDocument();

    expect(screen.getByText("Solar Installation")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute(
      "href",
      "/admin/services/svc-1/edit",
    );
    expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();
  });

  it("shows Unpublish for an already-published service", () => {
    render(<ServicesTable result={{ status: "ok", data: [{ ...item, status: "published" }] }} />);

    expect(screen.getByRole("button", { name: /unpublish/i })).toBeInTheDocument();
  });
});
