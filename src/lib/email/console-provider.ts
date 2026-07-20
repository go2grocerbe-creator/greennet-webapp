import type { EmailMessage, EmailProvider, EmailResult } from "./types";

/**
 * Dev/test default: never makes a network call, never sends a real
 * email. Logs only the subject and recipient — not the body — to avoid
 * dumping lead PII into local/CI logs. Always reports success so the
 * submission pipeline's happy path is exercisable without credentials.
 */
export const consoleEmailProvider: EmailProvider = {
  async send(message: EmailMessage): Promise<EmailResult> {
    console.log(`[email:console] would send "${message.subject}" to ${message.to}`);
    return { success: true, id: "console-dev" };
  },
};
