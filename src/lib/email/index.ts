import { consoleEmailProvider } from "./console-provider";
import { createResendProvider } from "./resend-provider";
import type { EmailProvider } from "./types";

/**
 * Real provider only when RESEND_API_KEY is actually configured —
 * otherwise the explicit console dev provider. Never silently swaps to a
 * fake "success" for a configured-but-broken real provider; that
 * distinction is the resend provider's own job to report accurately.
 */
export function getEmailProvider(): EmailProvider {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? createResendProvider(apiKey) : consoleEmailProvider;
}

export type { EmailMessage, EmailProvider, EmailResult } from "./types";
