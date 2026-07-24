import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SolarExperience } from "@/components/marketing/solar-experience";
import { Container } from "@/components/ui/container";

/**
 * The narrative describes general solar-energy physics and avoids unconfirmed
 * GreenNet-specific performance, warranty, product, or service claims.
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
              <h1 id="solar-title">Harness the power of the sun.</h1>
              <p className="solar-lede">Powering homes and businesses with clean solar energy.</p>
              <p className="solar-scroll-cue">
                Follow the sun <span aria-hidden="true">↓</span>
              </p>
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
                <time>06:30</time>
              </div>
              <p className="solar-kicker">01 / Collection</p>
              <h2 id="morning-title">Sunlight becomes power.</h2>
              <p className="solar-lede">
                Electricity is generated the moment light reaches the panels.
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
                <time>12:08</time>
              </div>
              <p className="solar-kicker">02 / Conversion</p>
              <h2 id="noon-title">Power becomes possibility.</h2>
              <p className="solar-lede">Reliable energy for homes and businesses.</p>
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
                <time>17:21</time>
              </div>
              <p className="solar-kicker">03 / Storage</p>
              <h2 id="golden-title">Energy becomes reserve.</h2>
              <p className="solar-lede">Store today&apos;s energy for when you need it most.</p>
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
                <time>18:47</time>
              </div>
              <p className="solar-kicker">04 / Handoff</p>
              <h2 id="sunset-title">The day transitions.</h2>
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
              <p className="solar-lede">Stored energy, working for you.</p>
            </div>
          </Container>
        </section>
      </SolarExperience>

      <section id="after-solar-story" className="story-exit" aria-labelledby="story-exit-title">
        <Container className="story-exit__inner">
          <p id="story-exit-title">Continue exploring</p>
          <nav aria-label="Continue exploring GreenNet">
            <Link href="/services">
              Solar Solutions <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/products">
              Products <ArrowRight aria-hidden="true" />
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
