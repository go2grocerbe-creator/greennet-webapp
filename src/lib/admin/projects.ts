import { projectInputSchema } from "@/lib/validation/project";

import type { DataResult } from "./data-result";
import { slugify, slugifyWithSuffix } from "./slug";
import type { ProjectsDataSource, ProjectStatus, RawProjectRow } from "./projects-data-source";

export type { DataResult } from "./data-result";
export type { ProjectStatus } from "./projects-data-source";

export const PROJECT_STATUSES: ProjectStatus[] = ["draft", "published"];

export type ProjectListItem = {
  id: string;
  title: string;
  status: ProjectStatus;
  updatedAt: string;
};

export type ProjectDetail = ProjectListItem & {
  slug: string;
  location: string;
  summary: string;
  description: string;
  completionDate: string | null;
  coverImage: string | null;
  sortOrder: number;
};

export function mapProjectListItem(row: RawProjectRow): ProjectListItem {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export function mapProjectDetail(row: RawProjectRow): ProjectDetail {
  return {
    ...mapProjectListItem(row),
    slug: row.slug,
    location: row.location ?? "",
    summary: row.summary ?? "",
    description: row.description ?? "",
    completionDate: row.completion_date,
    coverImage: row.cover_image_url,
    sortOrder: row.sort_order,
  };
}

export async function listProjects(
  ds: ProjectsDataSource | null,
): Promise<DataResult<ProjectListItem[]>> {
  if (!ds) return { status: "unavailable" };
  try {
    const { data, error } = await ds.list();
    if (error || !data) return { status: "unavailable" };
    return { status: "ok", data: data.map(mapProjectListItem) };
  } catch (error) {
    console.error("[admin] failed to list projects", error);
    return { status: "unavailable" };
  }
}

export async function getProject(
  ds: ProjectsDataSource | null,
  id: string,
): Promise<DataResult<ProjectDetail | null>> {
  if (!ds) return { status: "unavailable" };
  try {
    const { data, error } = await ds.getById(id);
    if (error) return { status: "unavailable" };
    return { status: "ok", data: data ? mapProjectDetail(data) : null };
  } catch (error) {
    console.error("[admin] failed to load project", error);
    return { status: "unavailable" };
  }
}

export type MutationResult =
  | { status: "ok"; id: string }
  | { status: "invalid"; fieldErrors: Record<string, string[]> }
  | { status: "unavailable" };

const UNIQUE_VIOLATION = "23505";

export async function createProject(
  ds: ProjectsDataSource | null,
  raw: unknown,
): Promise<MutationResult> {
  const parsed = projectInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "invalid", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (!ds) return { status: "unavailable" };

  const values = parsed.data;
  const row = {
    slug: slugify(values.title),
    title: values.title,
    location: values.location,
    summary: values.summary,
    description: values.description,
    completion_date: values.completionDate ?? null,
    cover_image_url: values.coverImage ?? null,
    sort_order: values.sortOrder ?? 0,
  };

  try {
    let { data, error } = await ds.create(row);

    if (error?.code === UNIQUE_VIOLATION) {
      ({ data, error } = await ds.create({ ...row, slug: slugifyWithSuffix(values.title) }));
    }

    if (error || !data) return { status: "unavailable" };
    return { status: "ok", id: data.id };
  } catch (error) {
    console.error("[admin] failed to create project", error);
    return { status: "unavailable" };
  }
}

/** Editing never changes the slug once a project exists — see services.ts for the same rule. */
export async function updateProject(
  ds: ProjectsDataSource | null,
  id: string,
  raw: unknown,
): Promise<MutationResult> {
  const parsed = projectInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "invalid", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (!id || !ds) return { status: "unavailable" };

  const values = parsed.data;
  try {
    const { data, error } = await ds.update(id, {
      title: values.title,
      location: values.location,
      summary: values.summary,
      description: values.description,
      completion_date: values.completionDate ?? null,
      cover_image_url: values.coverImage ?? null,
      sort_order: values.sortOrder ?? 0,
    });

    if (error || !data) return { status: "unavailable" };
    return { status: "ok", id: data.id };
  } catch (error) {
    console.error("[admin] failed to update project", error);
    return { status: "unavailable" };
  }
}

export function isValidProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as string[]).includes(value);
}

export type StatusMutationResult =
  { status: "ok" } | { status: "invalid" } | { status: "unavailable" };

export async function setProjectStatus(
  ds: ProjectsDataSource | null,
  id: string,
  status: string,
): Promise<StatusMutationResult> {
  if (!isValidProjectStatus(status)) return { status: "invalid" };
  if (!id || !ds) return { status: "unavailable" };

  try {
    const { error } = await ds.setStatus(id, status);
    if (error) return { status: "unavailable" };
    return { status: "ok" };
  } catch (error) {
    console.error("[admin] failed to update project status", error);
    return { status: "unavailable" };
  }
}
