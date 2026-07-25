# Requirements Register

Status: DRAFT
Last updated: 2026-07-25

Classification key:

- **CONFIRMED** — stated explicitly by the client/user in this conversation or an authored source document.
- **RECOMMENDED** — our professional recommendation, not yet confirmed by client.
- **ASSUMPTION** — a working assumption made to keep planning moving, must be validated.
- **MISSING** — a fact or decision needed but not present anywhere in source material.
- **BLOCKED** — work that cannot proceed correctly until a MISSING item is resolved.

## 1. Technology stack

| Item                                  | Classification | Notes                                                                                         |
| ------------------------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| Next.js App Router                    | CONFIRMED      | Explicit instruction                                                                          |
| TypeScript                            | CONFIRMED      |                                                                                               |
| Tailwind CSS                          | CONFIRMED      |                                                                                               |
| shadcn/ui                             | CONFIRMED      |                                                                                               |
| Supabase Postgres                     | CONFIRMED      |                                                                                               |
| Supabase Auth                         | CONFIRMED      |                                                                                               |
| Supabase Storage                      | CONFIRMED      |                                                                                               |
| Supabase Row Level Security           | CONFIRMED      |                                                                                               |
| React Hook Form                       | CONFIRMED      |                                                                                               |
| Zod                                   | CONFIRMED      |                                                                                               |
| Resend (or abstracted email provider) | CONFIRMED      | "abstracted" implies an interface/adapter, not a hard dependency — see `docs/architecture.md` |
| Cloudflare Turnstile                  | CONFIRMED      | Integration point only — not necessarily wired live in Phase 1                                |
| Vercel                                | CONFIRMED      | Deployment target                                                                             |
| Playwright                            | CONFIRMED      | E2E tests                                                                                     |
| Vitest                                | CONFIRMED      | Unit tests                                                                                    |
| Sentry                                | CONFIRMED      | Integration point only                                                                        |
| Google Analytics                      | CONFIRMED      | Integration point only                                                                        |

## 2. Pages (Phase 1)

| Page                          | Classification         | Notes                                                                                                                   |
| ----------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Home                          | CONFIRMED              |                                                                                                                         |
| About GreenNet                | CONFIRMED              | Content depends on MISSING company-history/positioning facts (§5)                                                       |
| Solar Solutions               | CONFIRMED              | Content depends on MISSING service-priority facts (§5)                                                                  |
| Products                      | CONFIRMED              | Content depends on MISSING brand/product facts (§5)                                                                     |
| Projects                      | CONFIRMED              | Depends on MISSING real project photography (§5) — BLOCKED for "featured/real" content, not blocked for schema/UI build |
| Contact / Request a Quotation | CONFIRMED              | Field list depends on MISSING quotation-requirements facts (§5)                                                         |
| Blog                          | CONFIRMED OUT OF SCOPE | "unless later confirmed" — treat as not building until explicit go-ahead                                                |

### 2.1 Solar Solutions editorial direction

The client explicitly supplied and confirmed the following service direction in the July 2026
project conversation:

| Pillar                       | Classification | Confirmed direction                                                                                                |
| ---------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Solar Energy Systems         | CONFIRMED      | Solar generation; inverters and battery storage; cabling and protection; commercial and residential configurations |
| Project Delivery             | CONFIRMED      | Site assessment; system planning; mounting structures; installation and handover                                   |
| Monitoring & System Care     | CONFIRMED      | Monitoring; diagnostic review; maintenance; warranty coordination where applicable                                 |
| EV Charging & Solar Carports | CONFIRMED      | EV charging; load management; solar carports; future expansion planning                                            |
| Six-stage project lifecycle  | CONFIRMED      | Discover → Assess → Specify → Quote → Install → Support                                                            |
| Sector pathways              | CONFIRMED      | Industrial/production, hospitality, commercial property, developers/estates, and premium homes as neutral pathways |

These confirmations authorize the editorial Solar Solutions architecture and neutral descriptions.
They do **not** confirm project history in any sector, geographic service coverage, exact warranties,
maintenance SLAs, monitoring-alert cadence, structural certification/sign-off, supplier
authenticity, savings, performance guarantees, or product-specific climate ratings. Those remain
MISSING until supported by client-approved operating terms or product documentation.

## 3. Functional requirements

| Requirement                                     | Classification | Notes                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Responsive public website                       | CONFIRMED      |                                                                                                                                                                                                                                                                                                                                                    |
| Reusable page components                        | CONFIRMED      |                                                                                                                                                                                                                                                                                                                                                    |
| Services/products/projects content              | CONFIRMED      | Data model required — see `docs/data-model.md`                                                                                                                                                                                                                                                                                                     |
| Featured projects                               | CONFIRMED      | Needs a `featured` flag in schema                                                                                                                                                                                                                                                                                                                  |
| Draft and published content states              | CONFIRMED      | Applies to services, products, projects — needs `status` enum                                                                                                                                                                                                                                                                                      |
| Structured quotation form                       | CONFIRMED      | Implemented at `/contact` (ADR-010) with an ASSUMPTION field set — full name, email (required), phone, company, location, property type, interested solution, electricity usage/bill, preferred contact method, project timeline, message, privacy consent. Exact field list is still MISSING client confirmation (see §5) — confirm before launch |
| Server-side validation                          | CONFIRMED      | Zod schemas shared/validated server-side, not just client-side                                                                                                                                                                                                                                                                                     |
| Spam protection                                 | CONFIRMED      | Turnstile is the confirmed integration point                                                                                                                                                                                                                                                                                                       |
| Secure lead storage                             | CONFIRMED      | Supabase Postgres + RLS, restricted to admin roles                                                                                                                                                                                                                                                                                                 |
| Notification and acknowledgement emails         | CONFIRMED      | Recipient list is MISSING (workbook Q: "Should enquiries be copied to multiple email addresses?" — unanswered)                                                                                                                                                                                                                                     |
| Restricted administrator dashboard              | CONFIRMED      |                                                                                                                                                                                                                                                                                                                                                    |
| Owner and editor roles                          | CONFIRMED      | Two roles only — no other role tiers confirmed                                                                                                                                                                                                                                                                                                     |
| Supabase authentication                         | CONFIRMED      |                                                                                                                                                                                                                                                                                                                                                    |
| Restricted media uploads                        | CONFIRMED      | Supabase Storage with RLS-gated buckets                                                                                                                                                                                                                                                                                                            |
| Site settings                                   | CONFIRMED      | Scope of "settings" (contact info, socials, SEO defaults) is ASSUMPTION — not itemized by client                                                                                                                                                                                                                                                   |
| Audit logging                                   | CONFIRMED      | Scope (which actions logged) is ASSUMPTION — recommend all content mutations + auth events                                                                                                                                                                                                                                                         |
| Technical SEO                                   | CONFIRMED      | Specifics (sitemap, robots, structured data, OG tags) is RECOMMENDED implementation detail                                                                                                                                                                                                                                                         |
| Analytics readiness                             | CONFIRMED      | GA integration point, not necessarily live-configured in Phase 1                                                                                                                                                                                                                                                                                   |
| Error-monitoring readiness                      | CONFIRMED      | Sentry integration point, same caveat                                                                                                                                                                                                                                                                                                              |
| Automated tests                                 | CONFIRMED      | Playwright + Vitest; coverage scope is RECOMMENDED                                                                                                                                                                                                                                                                                                 |
| Preview and production deployment documentation | CONFIRMED      | Deliverable of this phase — see `docs/architecture.md`                                                                                                                                                                                                                                                                                             |
| Handover and maintenance documentation          | CONFIRMED      | Deliverable                                                                                                                                                                                                                                                                                                                                        |

## 4. Explicitly out of scope (all CONFIRMED)

E-commerce, payments, shopping cart, customer accounts, customer portal, CRM, ERP, inventory management, multilingual content, advanced marketing automation, AI chatbot, solar calculator, automated pricing, drag-and-drop page builder, mobile application, blog (unless later confirmed).

## 5. MISSING client information (from blank discovery workbook)

None of the following have recorded answers. All are needed for accurate content and, in some cases, correct data-model/workflow decisions. Grouped by workbook section:

**Business goals**

- Main commercial result desired from the website (credibility / quotations / product sales / contracts / recruitment)
- Which service currently generates the most revenue
- Which service GreenNet wants to grow over the next 12 months
- Current pain points in how customers find/contact GreenNet
- Primary customer discovery channel today (referral / social / ads / search)
- Definition of a successful website at 6 months

**Target customers**

- Highest-priority customer segment (homeowners / offices / schools / hotels / factories / developers / resellers)
- Whether residential or commercial enquiries are more valuable
- Cities/regions/countries currently served (BLOCKS accurate service-area messaging and local SEO)
- Ideal vs. too-small vs. too-large project size
- Who makes vs. influences the purchase decision
- Questions serious customers ask before requesting a quote (should shape FAQ/form fields)

**Services & positioning**

- Detailed operating terms within the confirmed Solar Solutions pillars, including the exact
  boundaries between assessment, installation, monitoring, maintenance, EV charging and carport work
- Core reason to choose GreenNet over competitors
- Product brands sold/installed/recommended (BLOCKS Products page content and brand-usage permissions)
- Warranty / maintenance / after-sales support terms (BLOCKS "Why choose us" claims and legal accuracy)
- Common objections prospects raise
- Whether GreenNet offers financing/payment plans/maintenance contracts
- Any services that should NOT be promoted publicly
- Whether GreenNet provides structural-engineering sign-off directly or refers this to an
  appropriately qualified specialist
- Monitoring alert/report cadence and maintenance response expectations

**Trust & content assets**

- Whether real photographs of completed installations exist (BLOCKS Projects page authenticity — see `docs/content-register.md`)
- Project case-study details (location, type, equipment) for any real projects
- Verified customer testimonials
- Registrations/certifications/partnerships approved for display
- Official logo source file (SVG/PDF/high-res PNG) — only a flattened flyer JPEG exists currently
- Team/office/product/installation photography
- Who approves written content and factual claims (BLOCKS content sign-off workflow)

**Enquiry & sales process**

- Preferred primary CTA (call / WhatsApp / quotation form)
- Who receives and responds to website enquiries
- Typical response time (must not be overstated on-site)
- Information required to prepare a useful quotation (BLOCKS exact quotation-form field list)
- Whether site-assessment appointment booking is needed
- Whether enquiries should be copied to multiple emails or stored elsewhere
- Current lead follow-up process (informs whether a CRM integration will be wanted later — currently out of scope regardless)

**Functionality & content management**

- Final essential launch pages (site currently assumes the confirmed Phase 1 list above, which supersedes workbook uncertainty)
- Whether non-developer staff need to edit content (CONFIRMED via admin dashboard requirement — this specific question is effectively answered by the stack decision)
- Whether dedicated residential/commercial/industrial sub-pages are wanted
- Whether prices/catalogue will be displayed (Note: "automated pricing" and "e-commerce" are out of scope — but simple published price _display_, if wanted, is a distinct, unconfirmed question)
- Social platforms to link

**Technical access & administration**

- Domain ownership and account control
- Existing hosting or company email that must be preserved
- Who will own final domain/hosting/analytics/website accounts
- Whether a professional domain-based email address is already in use
- Privacy/cookie/legal text requirements
- Who is responsible for maintenance after the support period

**Scope, timing, budget, decision process**

- Launch deadline and its driver
- Final approver of design/content/budget
- Number of feedback reviewers
- Approved budget range
- Whether GreenNet will supply final content/images or whether content production must be quoted separately
- Competing providers under consideration
- Deferred/future features under consideration
- Any blocker preventing project start assuming scope/payment agreed

## 6. BLOCKED work items

| Item                                         | Blocked by                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| Final Projects page content                  | Real project photography confirmation (§5, Trust & content assets)                 |
| Final Products page content                  | Confirmed brand list and permissions (§5, Services & positioning)                  |
| Final quotation form field list              | "Information required to prepare a useful quotation" (§5, Enquiry & sales process) |
| Notification email recipient configuration   | "Should enquiries be copied to multiple email addresses" (§5)                      |
| Service-area / local SEO copy                | Confirmed cities/regions/countries served (§5)                                     |
| Legal pages (privacy policy, cookie notice)  | Client-supplied or approved legal text (§5)                                        |
| Go-live domain/DNS/Vercel production cutover | Domain ownership and account-control confirmation (§5)                             |
| "Why choose us" warranty/support claims      | Confirmed warranty and after-sales terms (§5)                                      |

None of these block starting the technical scaffold, data model, or component architecture — they block final content population and go-live, not development.
