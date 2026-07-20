import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuotationSummaryCards } from "@/components/admin/quotation-summary-cards";

describe("QuotationSummaryCards", () => {
  it("shows the unavailable notice instead of numbers when data couldn't be loaded", () => {
    render(<QuotationSummaryCards result={{ status: "unavailable" }} />);

    expect(screen.getByRole("status")).toHaveTextContent(/unavailable/i);
    expect(screen.queryByText("Total quotations")).not.toBeInTheDocument();
  });

  it("renders real counts, including a genuine zero, not a placeholder", () => {
    render(
      <QuotationSummaryCards
        result={{ status: "ok", data: { total: 0, new: 0, contacted: 0, closed: 0 } }}
      />,
    );

    expect(screen.getByText("Total quotations")).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(4);
  });

  it("renders the per-status breakdown", () => {
    render(
      <QuotationSummaryCards
        result={{ status: "ok", data: { total: 6, new: 2, contacted: 3, closed: 1 } }}
      />,
    );

    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
