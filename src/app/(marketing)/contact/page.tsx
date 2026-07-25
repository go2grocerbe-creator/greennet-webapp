import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { QuoteForm } from "@/components/contact/quote-form";
import { SolarPageHero } from "@/components/marketing/solar-page-hero";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config";
import {
  isInterestedSolutionValue,
  type InterestedSolutionValue,
} from "@/lib/validation/quote-request";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with GreenNet Energy or request a solar quotation.",
};

type ContactPageProps = {
  searchParams: Promise<{ interest?: string | string[] }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const interestParam = (await searchParams).interest;
  const requestedInterest = Array.isArray(interestParam) ? interestParam[0] : interestParam;
  const initialInterestedSolution: InterestedSolutionValue | undefined = isInterestedSolutionValue(
    requestedInterest,
  )
    ? requestedInterest
    : undefined;

  return (
    <>
      <SolarPageHero
        tone="night"
        eyebrow="Contact / Request a quotation"
        time="19:11"
        title="Turn daylight into a next step."
        description="Send a general enquiry or request a quotation for your property. GreenNet will review the details and follow up."
      />
      <Container className="contact-stage">
        <aside className="contact-direct" aria-labelledby="direct-contact-title">
          <p>Direct contact</p>
          <h2 id="direct-contact-title">Prefer a clear line?</h2>
          <ul>
            <li>
              <Phone aria-hidden="true" />
              <div>
                <span>Phone</span>
                <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}>
                  {siteConfig.contact.phone}
                </a>
              </div>
            </li>
            <li>
              <Mail aria-hidden="true" />
              <div>
                <span>Email</span>
                <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
              </div>
            </li>
            <li>
              <MapPin aria-hidden="true" />
              <div>
                <span>Address</span>
                <address>{siteConfig.contact.address}</address>
              </div>
            </li>
          </ul>
        </aside>

        <section className="contact-form-stage" aria-labelledby="enquiry-form-title">
          <div className="contact-form-stage__intro">
            <p>Quotation / general enquiry</p>
            <h2 id="enquiry-form-title">Tell us what you need.</h2>
            <span>Fields marked * are required.</span>
          </div>
          <QuoteForm
            turnstileSiteKey={turnstileSiteKey}
            initialInterestedSolution={initialInterestedSolution}
          />
        </section>
      </Container>
    </>
  );
}
