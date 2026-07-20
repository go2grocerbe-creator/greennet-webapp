import {
  CONTACT_METHOD_OPTIONS,
  INTERESTED_SOLUTION_OPTIONS,
  PROJECT_TIMELINE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  type QuoteRequestValues,
} from "@/lib/validation/quote-request";

import { escapeHtml } from "../escape-html";

function labelFor(
  options: readonly { value: string; label: string }[],
  value: string | undefined,
): string | undefined {
  return options.find((o) => o.value === value)?.label;
}

type NotificationContent = {
  subject: string;
  text: string;
  html: string;
};

/**
 * Internal GreenNet notification for a new quotation enquiry. Lists
 * exactly what was submitted — no invented facts, no price estimate, no
 * response-time promise (none is confirmed — see docs/requirements-register.md §5).
 */
export function buildQuoteNotificationEmail(
  data: QuoteRequestValues,
  reference: string,
): NotificationContent {
  const rows: [string, string | undefined][] = [
    ["Reference", reference],
    ["Full name", data.name],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Company", data.companyName],
    ["Location", data.location],
    ["Property type", labelFor(PROPERTY_TYPE_OPTIONS, data.propertyType)],
    ["Interested solution", labelFor(INTERESTED_SOLUTION_OPTIONS, data.interestedSolution)],
    ["Electricity usage / bill", data.electricityUsage],
    ["Preferred contact method", labelFor(CONTACT_METHOD_OPTIONS, data.preferredContactMethod)],
    ["Project timeline", labelFor(PROJECT_TIMELINE_OPTIONS, data.projectTimeline)],
  ];

  const definedRows = rows.filter((row): row is [string, string] => Boolean(row[1]));

  const text = [
    `New quotation enquiry — ${reference}`,
    "",
    ...definedRows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    data.message,
  ].join("\n");

  const html = [
    `<h1>New quotation enquiry — ${escapeHtml(reference)}</h1>`,
    "<table>",
    ...definedRows.map(
      ([label, value]) =>
        `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`,
    ),
    "</table>",
    "<p><strong>Message:</strong></p>",
    `<p>${escapeHtml(data.message).replace(/\n/g, "<br />")}</p>`,
  ].join("\n");

  return {
    subject: `New quotation enquiry — ${reference}`,
    text,
    html,
  };
}
