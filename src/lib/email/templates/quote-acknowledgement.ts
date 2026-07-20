import { siteConfig } from "@/lib/config";
import type { QuoteRequestValues } from "@/lib/validation/quote-request";

import { escapeHtml } from "../escape-html";

type AcknowledgementContent = {
  subject: string;
  text: string;
  html: string;
};

/**
 * Customer-facing acknowledgement. Deliberately neutral: no guaranteed
 * response time, no savings/pricing estimate, no installation timeline,
 * no certification/warranty/financing claims — none of those are
 * confirmed facts (see docs/requirements-register.md §5).
 */
export function buildQuoteAcknowledgementEmail(
  data: QuoteRequestValues,
  reference: string,
): AcknowledgementContent {
  const subject = `We received your enquiry — ${reference}`;

  const text = [
    `Hi ${data.name},`,
    "",
    `Thanks for contacting ${siteConfig.legalName}. We've received your enquiry (reference ${reference}) and someone from our team will follow up.`,
    "",
    "Your message:",
    data.message,
    "",
    `${siteConfig.legalName}`,
    siteConfig.contact.phone,
    siteConfig.contact.email,
  ].join("\n");

  const html = [
    `<p>Hi ${escapeHtml(data.name)},</p>`,
    `<p>Thanks for contacting ${escapeHtml(siteConfig.legalName)}. We've received your enquiry (reference <strong>${escapeHtml(reference)}</strong>) and someone from our team will follow up.</p>`,
    "<p><strong>Your message:</strong></p>",
    `<p>${escapeHtml(data.message).replace(/\n/g, "<br />")}</p>`,
    `<p>${escapeHtml(siteConfig.legalName)}<br />${escapeHtml(siteConfig.contact.phone)}<br />${escapeHtml(siteConfig.contact.email)}</p>`,
  ].join("\n");

  return { subject, text, html };
}
