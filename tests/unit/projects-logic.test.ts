import { describe, expect, it, vi } from "vitest";

import {
  createProject,
  getProject,
  listProjects,
  setProjectStatus,
  updateProject,
} from "@/lib/admin/projects";
import type { ProjectsDataSource, RawProjectRow } from "@/lib/admin/projects-data-source";

const rawRow: RawProjectRow = {
  id: "proj-1",
  slug: "residential-rooftop-install",
  title: "Residential Rooftop Install",
  location: "Benin City",
  summary: "Short description",
  description: "Full description",
  completion_date: null,
  cover_image_url: null,
  sort_order: 0,
  status: "draft",
  created_at: "2026-07-01T10:00:00.000Z",
  updated_at: "2026-07-01T10:00:00.000Z",
};

const validPayload = {
  title: "Residential Rooftop Install",
  location: "Benin City",
  summary: "Short description",
  description: "Full description",
  completionDate: "",
  coverImage: "",
  sortOrder: "",
};

function createDataSource(overrides: Partial<ProjectsDataSource> = {}): ProjectsDataSource {
  return {
    list: vi.fn().mockResolvedValue({ data: [rawRow], error: null }),
    getById: vi.fn().mockResolvedValue({ data: rawRow, error: null }),
    create: vi.fn().mockResolvedValue({ data: rawRow, error: null }),
    update: vi.fn().mockResolvedValue({ data: rawRow, error: null }),
    setStatus: vi.fn().mockResolvedValue({ error: null }),
    ...overrides,
  };
}

describe("listProjects / getProject", () => {
  it("returns unavailable when the data source is null", async () => {
    expect(await listProjects(null)).toEqual({ status: "unavailable" });
    expect(await getProject(null, "proj-1")).toEqual({ status: "unavailable" });
  });

  it("maps rows to the slim list shape", async () => {
    const ds = createDataSource();
    const result = await listProjects(ds);
    expect(result).toEqual({
      status: "ok",
      data: [
        {
          id: "proj-1",
          title: "Residential Rooftop Install",
          status: "draft",
          updatedAt: rawRow.updated_at,
        },
      ],
    });
  });

  it("maps the full detail shape including location and completion date", async () => {
    const ds = createDataSource({
      getById: vi
        .fn()
        .mockResolvedValue({ data: { ...rawRow, completion_date: "2026-03-15" }, error: null }),
    });
    const result = await getProject(ds, "proj-1");
    expect(result).toEqual({
      status: "ok",
      data: expect.objectContaining({ location: "Benin City", completionDate: "2026-03-15" }),
    });
  });
});

describe("createProject", () => {
  it("rejects an invalid payload without calling the data source", async () => {
    const ds = createDataSource();
    const result = await createProject(ds, { ...validPayload, location: "" });
    expect(result.status).toBe("invalid");
    expect(ds.create).not.toHaveBeenCalled();
  });

  it("creates with a slug derived from the title", async () => {
    const ds = createDataSource();
    const result = await createProject(ds, validPayload);
    expect(result).toEqual({ status: "ok", id: "proj-1" });
    expect(ds.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "residential-rooftop-install", title: validPayload.title }),
    );
  });

  it("retries once with a suffixed slug on a unique-constraint collision", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { code: "23505", message: "duplicate key" } })
      .mockResolvedValueOnce({ data: rawRow, error: null });
    const ds = createDataSource({ create });

    const result = await createProject(ds, validPayload);

    expect(result).toEqual({ status: "ok", id: "proj-1" });
    expect(create).toHaveBeenCalledTimes(2);
  });
});

describe("updateProject", () => {
  it("does not change the slug", async () => {
    const ds = createDataSource();
    await updateProject(ds, "proj-1", validPayload);
    expect(ds.update).toHaveBeenCalledWith(
      "proj-1",
      expect.not.objectContaining({ slug: expect.anything() }),
    );
  });
});

describe("setProjectStatus", () => {
  it("rejects an invalid status without calling the data source", async () => {
    const ds = createDataSource();
    const result = await setProjectStatus(ds, "proj-1", "archived");
    expect(result).toEqual({ status: "invalid" });
    expect(ds.setStatus).not.toHaveBeenCalled();
  });

  it("publishes successfully", async () => {
    const ds = createDataSource();
    const result = await setProjectStatus(ds, "proj-1", "published");
    expect(result).toEqual({ status: "ok" });
    expect(ds.setStatus).toHaveBeenCalledWith("proj-1", "published");
  });
});
