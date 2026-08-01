import { describe, expect, it, vi } from "vitest";

import {
  createService,
  getService,
  listServices,
  listServicesForPublic,
  setServiceStatus,
  updateService,
} from "@/lib/admin/services";
import type { RawServiceRow, ServicesDataSource } from "@/lib/admin/services-data-source";

const rawRow: RawServiceRow = {
  id: "svc-1",
  slug: "solar-installation",
  title: "Solar Installation",
  summary: "Short description",
  body: "Full description",
  icon: null,
  sort_order: 0,
  status: "draft",
  created_at: "2026-07-01T10:00:00.000Z",
  updated_at: "2026-07-01T10:00:00.000Z",
};

const validPayload = {
  title: "Solar Installation",
  summary: "Short description",
  body: "Full description",
  icon: "",
  sortOrder: "",
};

function createDataSource(overrides: Partial<ServicesDataSource> = {}): ServicesDataSource {
  return {
    list: vi.fn().mockResolvedValue({ data: [rawRow], error: null }),
    getById: vi.fn().mockResolvedValue({ data: rawRow, error: null }),
    create: vi.fn().mockResolvedValue({ data: rawRow, error: null }),
    update: vi.fn().mockResolvedValue({ data: rawRow, error: null }),
    setStatus: vi.fn().mockResolvedValue({ error: null }),
    ...overrides,
  };
}

describe("listServices / getService", () => {
  it("returns unavailable when the data source is null", async () => {
    expect(await listServices(null)).toEqual({ status: "unavailable" });
    expect(await getService(null, "svc-1")).toEqual({ status: "unavailable" });
  });

  it("maps rows on success", async () => {
    const ds = createDataSource();
    const result = await listServices(ds);
    expect(result).toEqual({
      status: "ok",
      data: [
        { id: "svc-1", title: "Solar Installation", status: "draft", updatedAt: rawRow.updated_at },
      ],
    });
  });
});

describe("listServicesForPublic", () => {
  it("returns unavailable when the data source is null", async () => {
    expect(await listServicesForPublic(null)).toEqual({ status: "unavailable" });
  });

  it("maps to the full detail shape and reuses the same list() call, not a second query", async () => {
    const ds = createDataSource({
      list: vi.fn().mockResolvedValue({
        data: [{ ...rawRow, status: "published" as const }],
        error: null,
      }),
    });
    const result = await listServicesForPublic(ds);
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: "svc-1",
          summary: "Short description",
          body: "Full description",
        }),
      );
    }
    expect(ds.list).toHaveBeenCalledTimes(1);
  });

  it("never returns draft records even when the data source can read them", async () => {
    const ds = createDataSource({
      list: vi.fn().mockResolvedValue({
        data: [rawRow, { ...rawRow, id: "svc-2", status: "published" as const }],
        error: null,
      }),
    });

    const result = await listServicesForPublic(ds);
    expect(result).toEqual({
      status: "ok",
      data: [expect.objectContaining({ id: "svc-2", status: "published" })],
    });
  });
});

describe("createService", () => {
  it("rejects an invalid payload without calling the data source", async () => {
    const ds = createDataSource();
    const result = await createService(ds, { ...validPayload, title: "" });
    expect(result.status).toBe("invalid");
    expect(ds.create).not.toHaveBeenCalled();
  });

  it("returns unavailable when the data source is null but the payload is valid", async () => {
    expect(await createService(null, validPayload)).toEqual({ status: "unavailable" });
  });

  it("creates with a slug derived from the title", async () => {
    const ds = createDataSource();
    const result = await createService(ds, validPayload);
    expect(result).toEqual({ status: "ok", id: "svc-1" });
    expect(ds.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "solar-installation", title: "Solar Installation" }),
    );
  });

  it("retries once with a suffixed slug on a unique-constraint collision", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { code: "23505", message: "duplicate key" } })
      .mockResolvedValueOnce({ data: rawRow, error: null });
    const ds = createDataSource({ create });

    const result = await createService(ds, validPayload);

    expect(result).toEqual({ status: "ok", id: "svc-1" });
    expect(create).toHaveBeenCalledTimes(2);
    const secondCallSlug = create.mock.calls[1]?.[0]?.slug as string;
    expect(secondCallSlug).not.toBe("solar-installation");
    expect(secondCallSlug.startsWith("solar-installation-")).toBe(true);
  });

  it("returns unavailable when a non-collision error occurs", async () => {
    const ds = createDataSource({
      create: vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } }),
    });
    expect(await createService(ds, validPayload)).toEqual({ status: "unavailable" });
  });
});

describe("updateService", () => {
  it("rejects an invalid payload", async () => {
    const ds = createDataSource();
    const result = await updateService(ds, "svc-1", { ...validPayload, body: "" });
    expect(result.status).toBe("invalid");
    expect(ds.update).not.toHaveBeenCalled();
  });

  it("does not change the slug", async () => {
    const ds = createDataSource();
    await updateService(ds, "svc-1", validPayload);
    expect(ds.update).toHaveBeenCalledWith(
      "svc-1",
      expect.not.objectContaining({ slug: expect.anything() }),
    );
  });

  it("updates successfully", async () => {
    const ds = createDataSource();
    const result = await updateService(ds, "svc-1", validPayload);
    expect(result).toEqual({ status: "ok", id: "svc-1" });
  });
});

describe("setServiceStatus", () => {
  it("rejects an invalid status without calling the data source", async () => {
    const ds = createDataSource();
    const result = await setServiceStatus(ds, "svc-1", "archived");
    expect(result).toEqual({ status: "invalid" });
    expect(ds.setStatus).not.toHaveBeenCalled();
  });

  it("publishes successfully", async () => {
    const ds = createDataSource();
    const result = await setServiceStatus(ds, "svc-1", "published");
    expect(result).toEqual({ status: "ok" });
    expect(ds.setStatus).toHaveBeenCalledWith("svc-1", "published");
  });

  it("returns unavailable when the update fails", async () => {
    const ds = createDataSource({
      setStatus: vi.fn().mockResolvedValue({ error: { message: "boom" } }),
    });
    expect(await setServiceStatus(ds, "svc-1", "draft")).toEqual({ status: "unavailable" });
  });
});
