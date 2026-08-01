import { consoleEmailProvider } from "./console-provider";
import { createResendProvider } from "./resend-provider";
import type { EmailProvider } from "./types";

/**
 * Real provider only when both Resend credentials are configured; otherwise
 * the explicit non-sending console provider. Never silently swaps to a fake
 * "success" for a configured-but-broken real provider.
 */
export function getEmailProvider(): EmailProvider {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS;
  if (apiKey && from) return createResendProvider(apiKey);
  if (apiKey && !from) {
    console.error(
      "[email] EMAIL_FROM_ADDRESS is required when RESEND_API_KEY is configured; using the non-sending provider.",
    );
  }
  return consoleEmailProvider;
}

export type { EmailMessage, EmailProvider, EmailResult } from "./types";
