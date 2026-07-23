import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin sign in",
  description: "Sign in to the GreenNet Energy admin dashboard.",
};

export default async function LoginPage() {
  const admin = await getAuthenticatedAdmin();
  if (admin) {
    redirect("/admin");
  }

  return (
    <div className="from-brand-soft-green/60 to-background flex min-h-screen flex-col items-center justify-center bg-gradient-to-b px-4 py-12">
      <p className="font-heading text-brand-deep-forest mb-6 flex items-center gap-2 text-lg font-bold tracking-tight">
        <span className="bg-brand-primary size-2.5 rounded-full" aria-hidden="true" />
        GreenNet Energy
      </p>
      <div className="border-border bg-background shadow-brand-md w-full max-w-sm rounded-xl border p-8">
        <h1 className="font-heading text-xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign in with your GreenNet admin account.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
