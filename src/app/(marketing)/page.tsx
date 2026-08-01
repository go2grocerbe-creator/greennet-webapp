import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

import { SolarExperience } from "@/components/marketing/solar-experience";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * All business-facing copy below is limited to confirmed taglines, location,
 * and contact facts. The intervening narrative explains general solar-energy
 * physics and does not claim GreenNet-specific performance or service terms.
 */
export default function HomePage() {
  return (
    <>
      <SolarExperience>
        <section
          id="solar-predawn"
          className="solar-chapter solar-chapter--predawn"
          aria-labelledby="solar-title"
        >
          <Container className="solar-chapter__inner">
            <div className="solar-chapter__copy solar-chapter__copy--hero">
              <div className="solar-time">
                <span>Pre-dawn</span>
              </div>
              <p className="solar-kicker">Harness the Power of the Sun Today</p>
              <h1 id="solar-title">Powering Homes &amp; Businesses with Clean Solar Energy</h1>
              <p className="solar-lede">A solar energy company in Benin City, Nigeria.</p>
              <div className="solar-actions">
                <Button
                  render={<Link href="/contact" />}
                  nativeButton={false}
                  size="lg"
                  className="solar-primary-action"
                >
                  Request a quotation <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Button>
                <a href="#solar-morning" className="solar-text-link">
                  Move the sun <ArrowDown aria-hidden="true" />
                </a>
              </div>
            </div>
          </Container>
        </section>

        <section
          id="solar-morning"
          className="solar-chapter solar-chapter--morning"
          aria-labelledby="morning-title"
        >
          <Container className="solar-chapter__inner solar-chapter__inner--right">
            <div className="solar-chapter__copy">
              <div className="solar-time">
                <span>Morning</span>
              </div>
              <p className="solar-kicker">01 / Collection</p>
              <h2 id="morning-title">Light becomes current.</h2>
              <p className="solar-lede">
                Photovoltaic cells receive daylight and begin collecting clean energy.
              </p>
              <Link href="/services" className="solar-text-link">
                Explore Solar Solutions <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </Container>
        </section>

        <section
          id="solar-noon"
          className="solar-chapter solar-chapter--noon"
          aria-labelledby="noon-title"
        >
          <Container className="solar-chapter__inner">
            <div className="solar-chapter__copy">
              <div className="solar-time">
                <span>Noon</span>
              </div>
              <p className="solar-kicker">02 / Conversion</p>
              <h2 id="noon-title">Sunlight becomes current.</h2>
              <p className="solar-lede">
                Photovoltaic cells produce direct current—quietly, without moving parts.
              </p>
            </div>
          </Container>
        </section>

        <section
          id="solar-golden"
          className="solar-chapter solar-chapter--golden"
          aria-labelledby="golden-title"
        >
          <Container className="solar-chapter__inner solar-chapter__inner--low">
            <div className="solar-chapter__copy">
              <div className="solar-time">
                <span>Golden hour</span>
              </div>
              <p className="solar-kicker">03 / Storage</p>
              <h2 id="golden-title">Energy becomes reserve.</h2>
              <p className="solar-lede">
                An inverter makes solar electricity usable. Batteries can hold surplus energy for
                the hours after daylight changes.
              </p>
              <Link href="/products" className="solar-text-link">
                See Products <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </Container>
        </section>

        <section
          id="solar-sunset"
          className="solar-chapter solar-chapter--sunset"
          aria-labelledby="sunset-title"
        >
          <Container className="solar-chapter__inner solar-chapter__inner--right solar-chapter__inner--low">
            <div className="solar-chapter__copy">
              <div className="solar-time">
                <span>Sunset</span>
              </div>
              <p className="solar-kicker">04 / Handoff</p>
              <h2 id="sunset-title">Light changes hands.</h2>
              <p className="solar-lede">
                The horizon darkens. Stored electricity carries the day forward as the environment
                moves into night.
              </p>
            </div>
          </Container>
        </section>

        <section
          id="solar-night"
          className="solar-chapter solar-chapter--night"
          aria-labelledby="night-title"
        >
          <Container className="solar-chapter__inner solar-chapter__inner--center">
            <div className="solar-chapter__copy solar-chapter__copy--night">
              <div className="solar-time">
                <span>Night</span>
              </div>
              <p className="solar-kicker">05 / Stored power</p>
              <h2 id="night-title">The sun is still working.</h2>
              <p className="solar-lede">
                The day&apos;s energy journey has reached the home. Tell us about your property or
                send a general enquiry.
              </p>
              <div className="solar-actions solar-actions--center">
                <Button
                  render={<Link href="/contact" />}
                  nativeButton={false}
                  size="lg"
                  className="solar-night-action"
                >
                  Request a quotation <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </SolarExperience>

      <section id="after-solar-story" className="story-exit" aria-labelledby="story-exit-title">
        <Container className="story-exit__inner">
          <p id="story-exit-title">Continue exploring</p>
          <nav aria-label="Continue exploring GreenNet">
            <Link href="/about">
              About GreenNet <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/services">
              Solar Solutions <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/products">
              Products <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/projects">
              Projects <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/contact">
              Contact <ArrowRight aria-hidden="true" />
            </Link>
          </nav>
        </Container>
      </section>
    </>
  );
}
