import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionHeading } from "@/components/ui/section-heading";

describe("SectionHeading", () => {
  it("renders the title and optional description", () => {
    render(<SectionHeading title="Solar Solutions" description="Placeholder description" />);

    expect(screen.getByRole("heading", { name: "Solar Solutions" })).toBeInTheDocument();
    expect(screen.getByText("Placeholder description")).toBeInTheDocument();
  });
});
