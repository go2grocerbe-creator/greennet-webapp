import { describe, expect, it, vi } from "vitest";

import {
  getQuotation,
  getQuotationSummary,
  listQuotations,
  updateQuotationStatus,
} from "@/lib/admin/quotations";
import type { QuotationsDataSource, RawQuotationRow } from "@/lib/admin/quotations-data-source";

const rawRow: RawQuotationRow = {
  id: "row-1",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: null,
  company_name: null,
  location: null,
  property_type: null,
  service_interest: null,
  electricity_usage: null,
  preferred_contact_method: null,
  project_timeline: null,
  message: "Please send a quotation.",
  status: "new",
  created_at: "2026-07-01T10:00:00.000Z",
};

function createDataSource(overrides: Partial<QuotationsDataSource> = {}): QuotationsDataSource {
  return {
    list: vi.fn().mockResolvedValue({ data: [rawRow], error: null }),
    getById: vi.fn().mockResolvedValue({ data: rawRow, error: null }),
    countByStatus: vi.fn().mockResolvedValue({ data: [{ status: "new" }], error: null }),
    updateStatus: vi.fn().mockResolvedValue({ error: null }),
    ...overrides,
  };
}

describe("listQuotations", () => {
  it("returns unavailable when the data source is null (Supabase not configured)", async () => {
    expect(await listQuotations(null)).toEqual({ status: "unavailable" });
  });

  it("returns unavailable when the query errors", async () => {
    const ds = createDataSource({
      list: vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } }),
    });
    expect(await listQuotations(ds)).toEqual({ status: "unavailable" });
  });

  it("maps rows on success", async () => {
    const ds = createDataSource();
    const result = await listQuotations(ds);
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.id).toBe("row-1");
    }
  });
});

describe("getQuotation", () => {
  it("returns unavailable when the data source is null", async () => {
    expect(await getQuotation(null, "row-1")).toEqual({ status: "unavailable" });
  });

  it("returns ok with null data when no row matches (not an error)", async () => {
    const ds = createDataSource({
      getById: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    expect(await getQuotation(ds, "missing")).toEqual({ status: "ok", data: null });
  });

  it("maps the row on success", async () => {
    const ds = createDataSource();
    const result = await getQuotation(ds, "row-1");
    expect(result).toEqual({ status: "ok", data: expect.objectContaining({ id: "row-1" }) });
  });
});

describe("getQuotationSummary", () => {
  it("returns unavailable when the data source is null", async () => {
    expect(await getQuotationSummary(null)).toEqual({ status: "unavailable" });
  });

  it("counts rows per status", async () => {
    const ds = createDataSource({
      countByStatus: vi.fn().mockResolvedValue({
        data: [{ status: "new" }, { status: "new" }, { status: "contacted" }, { status: "closed" }],
        error: null,
      }),
    });
    const result = await getQuotationSummary(ds);
    expect(result).toEqual({
      status: "ok",
      data: { total: 4, new: 2, contacted: 1, closed: 1 },
    });
  });

  it("reports zero counts (not unavailable) when there truly are no rows", async () => {
    const ds = createDataSource({
      countByStatus: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    const result = await getQuotationSummary(ds);
    expect(result).toEqual({ status: "ok", data: { total: 0, new: 0, contacted: 0, closed: 0 } });
  });
});

describe("updateQuotationStatus", () => {
  it("rejects an invalid status without calling the data source", async () => {
    const ds = createDataSource();
    const result = await updateQuotationStatus(ds, "row-1", "archived");
    expect(result).toEqual({ status: "invalid" });
    expect(ds.updateStatus).not.toHaveBeenCalled();
  });

  it("returns unavailable when the data source is null", async () => {
    expect(await updateQuotationStatus(null, "row-1", "contacted")).toEqual({
      status: "unavailable",
    });
  });

  it("returns unavailable when the update fails", async () => {
    const ds = createDataSource({
      updateStatus: vi.fn().mockResolvedValue({ error: { message: "boom" } }),
    });
    expect(await updateQuotationStatus(ds, "row-1", "contacted")).toEqual({
      status: "unavailable",
    });
  });

  it("updates successfully with a valid status", async () => {
    const ds = createDataSource();
    const result = await updateQuotationStatus(ds, "row-1", "contacted");
    expect(result).toEqual({ status: "ok" });
    expect(ds.updateStatus).toHaveBeenCalledWith("row-1", "contacted");
  });
});
