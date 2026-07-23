import type { EmailMessage, EmailProvider, EmailResult } from "./types";

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Real Resend adapter. Implemented for completeness of the provider
 * boundary but not exercised with a live API key in this milestone — see
 * docs/decision-log.md ADR-010 "Do not send real emails".
 */
export function createResendProvider(apiKey: string): EmailProvider {
  return {
    async send(message: EmailMessage): Promise<EmailResult> {
      try {
        const response = await fetch(RESEND_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: message.from,
            to: message.to,
            subject: message.subject,
            text: message.text,
            html: message.html,
          }),
        });

        if (!response.ok) {
          console.error(`[email:resend] send failed with status ${response.status}`);
          return { success: false, error: "provider_error" };
        }

        const data = (await response.json()) as { id?: string };
        return { success: true, id: data.id };
      } catch (error) {
        console.error("[email:resend] send request failed", error);
        return { success: false, error: "network_error" };
      }
    },
  };
}
