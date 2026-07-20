# Risk Register

Status: DRAFT — living document, revisit at each phase gate
Last updated: 2026-07-17

Severity: High / Medium / Low. Likelihood not scored separately at this stage — most entries below are near-certain given the current information gap, so severity is the operative sort.

## Content and business-fact risks

| Risk | Severity | Mitigation |
|---|---|---|
| No completed client discovery answers exist (workbook is blank) — About, Solar Solutions, Products, Contact content all rest on assumptions | High | Ship Phase 1 content as `draft` status, require explicit client review/publish action before anything goes live; track every assumption in `docs/requirements-register.md` §5 |
| Demo/flyer photography represented as real projects without confirmed provenance | High | `media.source_type` + `rights_confirmed` schema gate (ADR-005); Projects page ships empty/placeholder rather than populated with unverified images |
| "Why choose us" claims (warranty, support, pricing) published without verified backing facts | Medium | Hold this copy for explicit client legal/factual sign-off before production publish, per `docs/content-register.md` |
| Official logo only exists as a flattened flyer JPEG / hand-recreated inline SVG, no vector source | Low–Medium | Request true source file before final brand rollout; current recreation is usable for Phase 1 build/preview |
| Domain, hosting, and business email ownership unconfirmed | High | Blocks production DNS cutover only, not development — tracked explicitly in `docs/requirements-register.md` §6 (BLOCKED work items) |

## Process and scope risks

| Risk | Severity | Mitigation |
|---|---|---|
| Building a full quotation-form field list without confirmed "what information is needed for a quote" | Medium | Ship a reasonable assumption-based field set, explicitly flagged for pre-launch client confirmation; schema (`quote_requests`) is easy to extend, not a blocker to starting |
| Blog explicitly deferred ("unless later confirmed") but stakeholder expectations could drift toward wanting it mid-project | Low | `docs/project-brief.md` and `docs/requirements-register.md` both record this as confirmed out-of-scope; any change requires a new decision-log entry, not silent scope creep |
| Multiple uncoordinated reviewers slow content/design approval (workbook explicitly flags this as a risk pattern) | Medium | Recommend the client designate a single content approver per `docs/requirements-register.md` §5 open item; not something engineering can resolve unilaterally |
| No budget/timeline confirmed — cannot gate scope decisions against cost/schedule reality | High | Flagged as MISSING; do not commit to a launch date or feature cut line until this is confirmed |

## Technical and security risks

| Risk | Severity | Mitigation |
|---|---|---|
| Client-side-only role/session checks could be bypassed if RLS is misconfigured or forgotten on a new table | High | RLS is treated as an independent enforcement layer for every table by default (`docs/security-model.md`); no table ships without an explicit policy, including deny-by-default for new tables |
| Public quotation form abused for spam without effective Turnstile server-side verification | Medium | Server-side Turnstile siteverify check is mandatory before DB write (ADR-006), not just client-widget presence |
| Service-role Supabase key accidentally exposed client-side | High | Explicit environment-variable separation documented in `docs/security-model.md`; enforce via code review / lint rule once scaffolded (not yet implemented) |
| Draft content accidentally rendered on public routes due to a missed filter in a new query path | Medium | Recommend centralizing all public content reads through a single data-access module that unconditionally applies `status = 'published'`, rather than per-query discipline |
| Legacy demo accidentally deleted before production parity is verified | High | ADR-002 / `docs/migration-strategy.md` — branch preservation is a non-negotiable rule, verified before any deletion commit |
| Migration branch drifts significantly from `main`, complicating eventual merge/cutover | Low–Medium | Recommend regular rebases/merges from `main` into the migration branch if `main` receives any interim changes; currently `main` is expected to stay frozen during migration |

## Third-party dependency risks

| Risk | Severity | Mitigation |
|---|---|---|
| Resend (or chosen provider) outage blocks lead notification emails | Medium | Abstracted email-provider interface (`docs/architecture.md`) allows provider swap without call-site changes; consider a queued-retry pattern in implementation |
| Cloudflare Turnstile outage blocks all quotation submissions | Low–Medium | Acceptable Phase 1 risk given confirmed integration-point status; document a manual-fallback contact path (phone/email, already present in site content) so the business isn't fully blocked |
| Vercel/Supabase account ownership and billing responsibility unconfirmed | Medium | Same class of risk as domain/hosting ownership (§Content and business-fact risks) — needs client decision on who owns these accounts long-term |

## Risks explicitly out of scope for this register

E-commerce/payment security, CRM data handling, multi-tenant isolation, mobile app distribution — none apply, as none of those subsystems are in scope.
