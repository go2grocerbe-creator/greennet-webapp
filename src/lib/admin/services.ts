import { serviceInputSchema } from "@/lib/validation/service";

import type { DataResult } from "./data-result";
import { slugify, slugifyWithSuffix } from "./slug";
import type { RawServiceRow, ServiceStatus, ServicesDataSource } from "./services-data-source";

export type { DataResult } from "./data-result";
export type { ServiceStatus } from "./services-data-source";

export const SERVICE_STATUSES: ServiceStatus[] = ["draft", "published"];

export type ServiceListItem = {
  id: string;
  title: string;
  status: ServiceStatus;
  updatedAt: string;
};

export type ServiceDetail = ServiceListItem & {
  slug: string;
  summary: string;
  body: string;
  icon: string | null;
  sortOrder: number;
};

export function mapServiceListItem(row: RawServiceRow): ServiceListItem {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export function mapServiceDetail(row: RawServiceRow): ServiceDetail {
  return {
    ...mapServiceListItem(row),
    slug: row.slug,
    summary: row.summary ?? "",
    body: row.body ?? "",
    icon: row.icon,
    sortOrder: row.sort_order,
  };
}

export async function listServices(
  ds: ServicesDataSource | null,
): Promise<DataResult<ServiceListItem[]>> {
  if (!ds) return { status: "unavailable" };
  try {
    const { data, error } = await ds.list();
    if (error || !data) return { status: "unavailable" };
    return { status: "ok", data: data.map(mapServiceListItem) };
  } catch (error) {
    console.error("[admin] failed to list services", error);
    return { status: "unavailable" };
  }
}

/**
 * Uses the same ordered data-source query as the admin list, then applies an
 * explicit publication gate before mapping. This protects public rendering
 * even when an authenticated editor's RLS session can read draft rows.
 */
export async function listServicesForPublic(
  ds: ServicesDataSource | null,
): Promise<DataResult<ServiceDetail[]>> {
  if (!ds) return { status: "unavailable" };
  try {
    const { data, error } = await ds.list();
    if (error || !data) return { status: "unavailable" };
    return {
      status: "ok",
      data: data.filter((row) => row.status === "published").map(mapServiceDetail),
    };
  } catch (error) {
    console.error("[admin] failed to list services for public page", error);
    return { status: "unavailable" };
  }
}

export async function getService(
  ds: ServicesDataSource | null,
  id: string,
): Promise<DataResult<ServiceDetail | null>> {
  if (!ds) return { status: "unavailable" };
  try {
    const { data, error } = await ds.getById(id);
    if (error) return { status: "unavailable" };
    return { status: "ok", data: data ? mapServiceDetail(data) : null };
  } catch (error) {
    console.error("[admin] failed to load service", error);
    return { status: "unavailable" };
  }
}

export type MutationResult =
  | { status: "ok"; id: string }
  | { status: "invalid"; fieldErrors: Record<string, string[]> }
  | { status: "unavailable" };

const UNIQUE_VIOLATION = "23505";

export async function createService(
  ds: ServicesDataSource | null,
  raw: unknown,
): Promise<MutationResult> {
  const parsed = serviceInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "invalid", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (!ds) return { status: "unavailable" };

  const values = parsed.data;
  const row = {
    slug: slugify(values.title),
    title: values.title,
    summary: values.summary,
    body: values.body,
    icon: values.icon ?? null,
    sort_order: values.sortOrder ?? 0,
  };

  try {
    let { data, error } = await ds.create(row);

    if (error?.code === UNIQUE_VIOLATION) {
      // Slug collision (another service already has this title's slug) —
      // one retry with a short unique suffix rather than looping lookups.
      ({ data, error } = await ds.create({ ...row, slug: slugifyWithSuffix(values.title) }));
    }

    if (error || !data) return { status: "unavailable" };
    return { status: "ok", id: data.id };
  } catch (error) {
    console.error("[admin] failed to create service", error);
    return { status: "unavailable" };
  }
}

/**
 * Editing never changes the slug once a service exists — keeps any
 * future public URL for it stable even if the title is edited later.
 */
export async function updateService(
  ds: ServicesDataSource | null,
  id: string,
  raw: unknown,
): Promise<MutationResult> {
  const parsed = serviceInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "invalid", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (!id || !ds) return { status: "unavailable" };

  const values = parsed.data;
  try {
    const { data, error } = await ds.update(id, {
      title: values.title,
      summary: values.summary,
      body: values.body,
      icon: values.icon ?? null,
      sort_order: values.sortOrder ?? 0,
    });

    if (error || !data) return { status: "unavailable" };
    return { status: "ok", id: data.id };
  } catch (error) {
    console.error("[admin] failed to update service", error);
    return { status: "unavailable" };
  }
}

export function isValidServiceStatus(value: string): value is ServiceStatus {
  return (SERVICE_STATUSES as string[]).includes(value);
}

export type StatusMutationResult =
  { status: "ok" } | { status: "invalid" } | { status: "unavailable" };

export async function setServiceStatus(
  ds: ServicesDataSource | null,
  id: string,
  status: string,
): Promise<StatusMutationResult> {
  if (!isValidServiceStatus(status)) return { status: "invalid" };
  if (!id || !ds) return { status: "unavailable" };

  try {
    const { error } = await ds.setStatus(id, status);
    if (error) return { status: "unavailable" };
    return { status: "ok" };
  } catch (error) {
    console.error("[admin] failed to update service status", error);
    return { status: "unavailable" };
  }
}
