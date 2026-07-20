import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectsTable } from "@/components/admin/projects-table";
import type { ProjectListItem } from "@/lib/admin/projects";

const item: ProjectListItem = {
  id: "proj-1",
  title: "Residential Rooftop Install",
  status: "draft",
  updatedAt: "2026-07-01T10:00:00.000Z",
};

describe("ProjectsTable", () => {
  it("shows the unavailable notice instead of a table when data couldn't be loaded", () => {
    render(<ProjectsTable result={{ status: "unavailable" }} />);
    expect(screen.getByRole("status")).toHaveTextContent(/unavailable/i);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows a genuine empty-state message for zero projects, not a fake row", () => {
    render(<ProjectsTable result={{ status: "ok", data: [] }} />);
    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders column headers, row data, and both actions", () => {
    render(<ProjectsTable result={{ status: "ok", data: [item] }} />);

    expect(screen.getByRole("columnheader", { name: "Project name" })).toBeInTheDocument();
    expect(screen.getByText("Residential Rooftop Install")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute(
      "href",
      "/admin/projects/proj-1/edit",
    );
    expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();
  });

  it("shows Unpublish for an already-published project", () => {
    render(<ProjectsTable result={{ status: "ok", data: [{ ...item, status: "published" }] }} />);
    expect(screen.getByRole("button", { name: /unpublish/i })).toBeInTheDocument();
  });
});
