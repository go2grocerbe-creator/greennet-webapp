const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { success: true; reason?: "dev_bypass" }
  | { success: false; reason: "not_configured" | "invalid_token" | "network_error" };

/**
 * Verifies a Turnstile token server-side. Reads TURNSTILE_SECRET_KEY
 * directly from process.env (not via getServerEnv()) so this module has
 * no accidental dependency on unrelated required server env vars.
 *
 * Development/test bypass: if the secret is absent outside production,
 * verification is skipped and logged. Production fails closed when the
 * secret is absent. If configured, every environment performs a real check.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[turnstile] TURNSTILE_SECRET_KEY is required in production.");
      return { success: false, reason: "not_configured" };
    }
    console.warn(
      "[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification (dev/test bypass).",
    );
    return { success: true, reason: "dev_bypass" };
  }

  if (!token) {
    return { success: false, reason: "invalid_token" };
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const result = (await response.json()) as { success: boolean };
    return result.success ? { success: true } : { success: false, reason: "invalid_token" };
  } catch (error) {
    console.error("[turnstile] verification request failed", error);
    return { success: false, reason: "network_error" };
  }
}
