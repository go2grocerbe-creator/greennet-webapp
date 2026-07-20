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
    <div className="bg-muted/30 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="border-border bg-background w-full max-w-sm rounded-lg border p-8 shadow-sm">
        <h1 className="font-heading text-xl font-semibold">Admin sign in</h1>
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
