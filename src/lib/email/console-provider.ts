import type { EmailMessage, EmailProvider, EmailResult } from "./types";

/**
 * Dev/test default: never makes a network call, never sends a real
 * email. Logs only the non-PII subject — never the recipient or body — to
 * avoid dumping lead data into local/CI logs. Always reports success so the
 * submission pipeline's happy path is exercisable without credentials.
 */
export const consoleEmailProvider: EmailProvider = {
  async send(message: EmailMessage): Promise<EmailResult> {
    console.info(`[email:console] suppressed "${message.subject}"`);
    return { success: true, id: "console-dev" };
  },
};
