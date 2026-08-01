import { describe, expect, it, vi } from "vitest";

import {
  createProduct,
  getProduct,
  listProducts,
  listProductsForPublic,
  setProductStatus,
  updateProduct,
} from "@/lib/admin/products";
import type { ProductsDataSource, RawProductRow } from "@/lib/admin/products-data-source";

const rawRow: RawProductRow = {
  id: "prod-1",
  slug: "solar-panel-400w",
  name: "Solar Panel 400W",
  summary: "Short description",
  description: "Full description",
  image_url: null,
  sort_order: 0,
  status: "draft",
  created_at: "2026-07-01T10:00:00.000Z",
  updated_at: "2026-07-01T10:00:00.000Z",
};

const validPayload = {
  title: "Solar Panel 400W",
  summary: "Short description",
  description: "Full description",
  image: "",
  sortOrder: "",
};

function createDataSource(overrides: Partial<ProductsDataSource> = {}): ProductsDataSource {
  return {
    list: vi.fn().mockResolvedValue({ data: [rawRow], error: null }),
    getById: vi.fn().mockResolvedValue({ data: rawRow, error: null }),
    create: vi.fn().mockResolvedValue({ data: rawRow, error: null }),
    update: vi.fn().mockResolvedValue({ data: rawRow, error: null }),
    setStatus: vi.fn().mockResolvedValue({ error: null }),
    ...overrides,
  };
}

describe("listProducts / getProduct", () => {
  it("returns unavailable when the data source is null", async () => {
    expect(await listProducts(null)).toEqual({ status: "unavailable" });
    expect(await getProduct(null, "prod-1")).toEqual({ status: "unavailable" });
  });

  it("maps rows to the slim list shape", async () => {
    const ds = createDataSource();
    const result = await listProducts(ds);
    expect(result).toEqual({
      status: "ok",
      data: [
        { id: "prod-1", title: "Solar Panel 400W", status: "draft", updatedAt: rawRow.updated_at },
      ],
    });
  });
});

describe("listProductsForPublic", () => {
  it("returns unavailable when the data source is null", async () => {
    expect(await listProductsForPublic(null)).toEqual({ status: "unavailable" });
  });

  it("maps to the full detail shape needed for public display", async () => {
    const ds = createDataSource({
      list: vi.fn().mockResolvedValue({
        data: [{ ...rawRow, status: "published" as const }],
        error: null,
      }),
    });
    const result = await listProductsForPublic(ds);
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: "prod-1",
          title: "Solar Panel 400W",
          summary: "Short description",
          description: "Full description",
        }),
      );
    }
  });

  it("preserves the order returned by the data source (ordering happens in the SQL query, not here)", async () => {
    const rowA = { ...rawRow, id: "a", name: "Zebra Panel", status: "published" as const };
    const rowB = { ...rawRow, id: "b", name: "Alpha Panel", status: "published" as const };
    const ds = createDataSource({
      list: vi.fn().mockResolvedValue({ data: [rowA, rowB], error: null }),
    });

    const result = await listProductsForPublic(ds);

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data.map((p) => p.id)).toEqual(["a", "b"]);
    }
  });

  it("reuses the same list() call as the admin listing — not a second query", async () => {
    const ds = createDataSource();
    await listProducts(ds);
    await listProductsForPublic(ds);
    expect(ds.list).toHaveBeenCalledTimes(2);
    expect(ds.getById).not.toHaveBeenCalled();
  });

  it("never returns draft records even when the data source can read them", async () => {
    const ds = createDataSource({
      list: vi.fn().mockResolvedValue({
        data: [rawRow, { ...rawRow, id: "prod-2", status: "published" as const }],
        error: null,
      }),
    });

    const result = await listProductsForPublic(ds);
    expect(result).toEqual({
      status: "ok",
      data: [expect.objectContaining({ id: "prod-2", status: "published" })],
    });
  });
});

describe("createProduct", () => {
  it("rejects an invalid payload without calling the data source", async () => {
    const ds = createDataSource();
    const result = await createProduct(ds, { ...validPayload, title: "" });
    expect(result.status).toBe("invalid");
    expect(ds.create).not.toHaveBeenCalled();
  });

  it("creates with a slug derived from the title", async () => {
    const ds = createDataSource();
    const result = await createProduct(ds, validPayload);
    expect(result).toEqual({ status: "ok", id: "prod-1" });
    expect(ds.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "solar-panel-400w", name: "Solar Panel 400W" }),
    );
  });

  it("retries once with a suffixed slug on a unique-constraint collision", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { code: "23505", message: "duplicate key" } })
      .mockResolvedValueOnce({ data: rawRow, error: null });
    const ds = createDataSource({ create });

    const result = await createProduct(ds, validPayload);

    expect(result).toEqual({ status: "ok", id: "prod-1" });
    expect(create).toHaveBeenCalledTimes(2);
  });
});

describe("updateProduct", () => {
  it("does not change the slug", async () => {
    const ds = createDataSource();
    await updateProduct(ds, "prod-1", validPayload);
    expect(ds.update).toHaveBeenCalledWith(
      "prod-1",
      expect.not.objectContaining({ slug: expect.anything() }),
    );
  });
});

describe("setProductStatus", () => {
  it("rejects an invalid status without calling the data source", async () => {
    const ds = createDataSource();
    const result = await setProductStatus(ds, "prod-1", "archived");
    expect(result).toEqual({ status: "invalid" });
    expect(ds.setStatus).not.toHaveBeenCalled();
  });

  it("publishes successfully", async () => {
    const ds = createDataSource();
    const result = await setProductStatus(ds, "prod-1", "published");
    expect(result).toEqual({ status: "ok" });
    expect(ds.setStatus).toHaveBeenCalledWith("prod-1", "published");
  });
});
