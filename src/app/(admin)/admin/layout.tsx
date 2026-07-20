import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Auth gate foundation only. Middleware (src/middleware.ts) already blocks
 * unauthenticated requests to /admin — this is the defense-in-depth layer
 * per docs/security-model.md ("neither layer is relied on alone"). Role
 * checks (owner vs. editor) and the real dashboard shell are not built yet.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <div className="bg-muted/30 min-h-screen">{children}</div>;
}
