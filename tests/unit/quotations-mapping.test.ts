import { describe, expect, it } from "vitest";

import {
  isValidQuotationStatus,
  mapQuotationDetail,
  mapQuotationListItem,
} from "@/lib/admin/quotations";
import type { RawQuotationRow } from "@/lib/admin/quotations-data-source";

const rawRow: RawQuotationRow = {
  id: "row-1",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+234 906 312 1247",
  company_name: "Acme Ltd",
  location: "Benin City",
  property_type: "residential",
  service_interest: "installation",
  electricity_usage: "50000/month",
  preferred_contact_method: "whatsapp",
  project_timeline: "within_3_months",
  message: "Please send a quotation.",
  status: "new",
  created_at: "2026-07-01T10:00:00.000Z",
};

describe("mapQuotationListItem", () => {
  it("maps only the list-relevant fields", () => {
    expect(mapQuotationListItem(rawRow)).toEqual({
      id: "row-1",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+234 906 312 1247",
      interestedSolution: "installation",
      status: "new",
      createdAt: "2026-07-01T10:00:00.000Z",
    });
  });

  it("passes through null optional fields as null, not undefined or empty string", () => {
    const sparse: RawQuotationRow = { ...rawRow, phone: null, service_interest: null };
    const mapped = mapQuotationListItem(sparse);
    expect(mapped.phone).toBeNull();
    expect(mapped.interestedSolution).toBeNull();
  });
});

describe("mapQuotationDetail", () => {
  it("includes all detail fields on top of the list fields", () => {
    const mapped = mapQuotationDetail(rawRow);
    expect(mapped).toEqual({
      id: "row-1",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+234 906 312 1247",
      interestedSolution: "installation",
      status: "new",
      createdAt: "2026-07-01T10:00:00.000Z",
      companyName: "Acme Ltd",
      location: "Benin City",
      propertyType: "residential",
      electricityUsage: "50000/month",
      preferredContactMethod: "whatsapp",
      projectTimeline: "within_3_months",
      message: "Please send a quotation.",
    });
  });
});

describe("isValidQuotationStatus", () => {
  it.each(["new", "contacted", "closed"])("accepts %s", (status) => {
    expect(isValidQuotationStatus(status)).toBe(true);
  });

  it.each(["pending", "", "New", "archived"])("rejects %s", (status) => {
    expect(isValidQuotationStatus(status)).toBe(false);
  });
});
