/**
 * Tri-state result shared by every admin data read: "ok" with real data,
 * or "unavailable" — covers both "Supabase isn't configured" and "the
 * query failed" the same way, since the UI treats both identically (a
 * friendly notice, never a fake number/row) — see docs/decision-log.md
 * ADR-011.
 */
export type DataResult<T> = { status: "ok"; data: T } | { status: "unavailable" };
