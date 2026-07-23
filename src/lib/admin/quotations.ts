import type { DataResult } from "./data-result";
import type { QuotationsDataSource, RawQuotationRow } from "./quotations-data-source";

export type { DataResult } from "./data-result";

export type QuotationStatus = "new" | "contacted" | "closed";
export const QUOTATION_STATUSES: QuotationStatus[] = ["new", "contacted", "closed"];

export type QuotationListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interestedSolution: string | null;
  status: QuotationStatus;
  createdAt: string;
};

export type QuotationDetail = QuotationListItem & {
  companyName: string | null;
  location: string | null;
  propertyType: string | null;
  electricityUsage: string | null;
  preferredContactMethod: string | null;
  projectTimeline: string | null;
  message: string;
};

export type QuotationSummary = {
  total: number;
  new: number;
  contacted: number;
  closed: number;
};

export function mapQuotationListItem(row: RawQuotationRow): QuotationListItem {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    interestedSolution: row.service_interest,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapQuotationDetail(row: RawQuotationRow): QuotationDetail {
  return {
    ...mapQuotationListItem(row),
    companyName: row.company_name,
    location: row.location,
    propertyType: row.property_type,
    electricityUsage: row.electricity_usage,
    preferredContactMethod: row.preferred_contact_method,
    projectTimeline: row.project_timeline,
    message: row.message,
  };
}

export async function listQuotations(
  ds: QuotationsDataSource | null,
): Promise<DataResult<QuotationListItem[]>> {
  if (!ds) return { status: "unavailable" };
  try {
    const { data, error } = await ds.list();
    if (error || !data) return { status: "unavailable" };
    return { status: "ok", data: data.map(mapQuotationListItem) };
  } catch (error) {
    console.error("[admin] failed to list quotations", error);
    return { status: "unavailable" };
  }
}

export async function getQuotation(
  ds: QuotationsDataSource | null,
  id: string,
): Promise<DataResult<QuotationDetail | null>> {
  if (!ds) return { status: "unavailable" };
  try {
    const { data, error } = await ds.getById(id);
    if (error) return { status: "unavailable" };
    return { status: "ok", data: data ? mapQuotationDetail(data) : null };
  } catch (error) {
    console.error("[admin] failed to load quotation", error);
    return { status: "unavailable" };
  }
}

export async function getQuotationSummary(
  ds: QuotationsDataSource | null,
): Promise<DataResult<QuotationSummary>> {
  if (!ds) return { status: "unavailable" };
  try {
    const { data, error } = await ds.countByStatus();
    if (error || !data) return { status: "unavailable" };

    const summary: QuotationSummary = { total: data.length, new: 0, contacted: 0, closed: 0 };
    for (const row of data) {
      summary[row.status] += 1;
    }
    return { status: "ok", data: summary };
  } catch (error) {
    console.error("[admin] failed to summarize quotations", error);
    return { status: "unavailable" };
  }
}

export function isValidQuotationStatus(value: string): value is QuotationStatus {
  return (QUOTATION_STATUSES as string[]).includes(value);
}

export type UpdateStatusResult =
  { status: "ok" } | { status: "invalid" } | { status: "unavailable" };

export async function updateQuotationStatus(
  ds: QuotationsDataSource | null,
  id: string,
  status: string,
): Promise<UpdateStatusResult> {
  if (!isValidQuotationStatus(status)) return { status: "invalid" };
  if (!id || !ds) return { status: "unavailable" };

  try {
    const { error } = await ds.updateStatus(id, status);
    if (error) return { status: "unavailable" };
    return { status: "ok" };
  } catch (error) {
    console.error("[admin] failed to update quotation status", error);
    return { status: "unavailable" };
  }
}
