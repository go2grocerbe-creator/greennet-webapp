import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

/**
 * Auth gate. The request proxy (src/proxy.ts) already blocks unauthenticated
 * requests to /admin — this is the defense-in-depth layer per
 * docs/security-model.md ("neither layer is relied on alone"), and it's
 * also where the role check against `profiles` happens (middleware only
 * checks session presence — see src/lib/auth/session.ts).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/login");
  }

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
