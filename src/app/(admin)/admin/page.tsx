import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

export default async function AdminDashboardPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm" data-testid="logout-button">
            Log out
          </Button>
        </form>
      </div>
      <p className="text-muted-foreground mt-2">
        Signed in as {admin.fullName ?? admin.id} ({admin.role}). Content management
        (services/products/projects), leads, media, site settings, and audit log views are not built
        yet — see docs/architecture.md.
      </p>
    </div>
  );
}
