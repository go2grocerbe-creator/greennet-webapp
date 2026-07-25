import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SolutionCapabilityList } from "@/components/marketing/solution-capability-list";
import { SolutionLifecycle } from "@/components/marketing/solution-lifecycle";
import { SolutionPillarGrid } from "@/components/marketing/solution-pillar-grid";
import {
  SOLUTION_CAPABILITIES,
  SOLUTION_LIFECYCLE,
  SOLUTION_PILLARS,
} from "@/lib/content/solar-solutions";

afterEach(cleanup);

describe("Solar Solutions editorial components", () => {
  it("renders the four confirmed solution pillars as one ordered ledger", () => {
    render(<SolutionPillarGrid pillars={SOLUTION_PILLARS} />);

    const ledger = screen.getAllByRole("list")[0];
    expect(ledger.children).toHaveLength(4);
    for (const pillar of SOLUTION_PILLARS) {
      expect(screen.getByRole("heading", { name: pillar.title })).toBeInTheDocument();
    }
  });

  it("renders the lifecycle as an ordered sequence", () => {
    render(<SolutionLifecycle steps={SOLUTION_LIFECYCLE} />);

    const lifecycle = screen.getByRole("list", { name: "Solar solution lifecycle" });
    expect(lifecycle.tagName).toBe("OL");
    expect(
      within(lifecycle)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(SOLUTION_LIFECYCLE.map((step) => step.title));
  });

  it("links each capability to an allow-listed contact interest", () => {
    render(<SolutionCapabilityList capabilities={SOLUTION_CAPABILITIES} />);

    const links = screen.getAllByRole("link", { name: /discuss this capability/i });
    expect(links).toHaveLength(SOLUTION_CAPABILITIES.length);
    links.forEach((link, index) => {
      expect(link).toHaveAttribute(
        "href",
        `/contact?interest=${SOLUTION_CAPABILITIES[index].interest}`,
      );
    });
  });
});
