import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { QuoteForm } from "@/components/contact/quote-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with GreenNet Energy or request a solar quotation. We'll follow up with your enquiry.",
};

export default function ContactPage() {
  // Read directly rather than via getPublicEnv(): this page doesn't need
  // Supabase's URL/anon key, and going through the full public-env schema
  // would force this page to require them too, blocking a build/preview
  // that has no Supabase project configured yet.
  const NEXT_PUBLIC_TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Get in touch"
        title="Contact us / Request a quotation"
        description="Send a general enquiry or request a quotation for your property. We'll review your details and follow up."
      />
      <div className="mt-10 max-w-3xl">
        <QuoteForm turnstileSiteKey={NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
      </div>
    </Container>
  );
}
