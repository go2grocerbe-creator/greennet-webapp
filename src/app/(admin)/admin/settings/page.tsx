import { CheckCircle2, ShieldCheck } from "lucide-react";

import { siteConfig } from "@/lib/config";

export default function AdminSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Site settings</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Review the verified company information currently used across the public site.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section
          className="border-border bg-card rounded-xl border p-5"
          aria-labelledby="identity-title"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-primary size-5" aria-hidden="true" />
            <h2 id="identity-title" className="font-heading font-semibold">
              Verified public identity
            </h2>
          </div>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Legal name</dt>
              <dd className="mt-1 font-medium">{siteConfig.legalName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Public phone</dt>
              <dd className="mt-1 font-medium">{siteConfig.contact.phone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Public email</dt>
              <dd className="mt-1 font-medium">{siteConfig.contact.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd className="mt-1 leading-relaxed font-medium">{siteConfig.contact.address}</dd>
            </div>
          </dl>
        </section>

        <section
          className="border-border bg-card rounded-xl border p-5"
          aria-labelledby="change-control-title"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary size-5" aria-hidden="true" />
            <h2 id="change-control-title" className="font-heading font-semibold">
              Change control
            </h2>
          </div>
          <p className="text-muted-foreground mt-5 text-sm leading-relaxed">
            Public business details remain centralized in the typed site configuration and mirrored
            by the Supabase seed. Update them only after client approval so navigation, contact,
            email fallback, metadata, and structured data stay consistent.
          </p>
          <p className="border-border mt-4 border-t pt-4 text-sm">
            Social links remain hidden until the client confirms the official accounts.
          </p>
        </section>
      </div>
    </div>
  );
}
