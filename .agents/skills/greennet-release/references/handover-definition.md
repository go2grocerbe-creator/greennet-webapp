# Handover-ready definition

A GreenNet release is ready for client review when the following are true or explicitly documented as blocked.

## Website

- Home
- About
- Services or Solutions
- Products or Product Categories
- Projects, Gallery, or Capabilities
- Contact and Quotation Request
- Basic admin dashboard only where supported by the existing architecture

## Functional quality

- Responsive at mobile, tablet, laptop, and desktop widths
- Navigation and calls to action work
- Contact/quotation form validates and has clear success and error states
- Existing backend integration is secure and functional
- No visible placeholders, missing images, broken imports, or dead routes
- No private secrets in frontend or repository
- Semantic headings, alt text, keyboard access, focus states, and reduced-motion handling
- Page titles, descriptions, favicon, social metadata, sitemap, and robots configuration where appropriate
- Production build succeeds

## Handover files

### README.md

Include purpose, stack, installation, environment variables, development, testing, build, deployment, admin usage, and content-editing notes.

### HANDOVER.md

Include routes, admin routes, services used without passwords, environment variables, deployment/domain steps, form destination, asset locations, known limitations, client-verification items, backup/rollback, and post-launch checklist.

### .env.example

List every required variable with safe comments and no real secrets.

### CLIENT_APPROVAL_CHECKLIST.md

Include verification for final logo, legal name, registration details, address, phone/WhatsApp, public email, service areas, brands, specifications, certifications, warranties, partner claims, project photographs, testimonials, privacy/cookie wording, form recipient, domain, and analytics.

### RELEASE_CHECKLIST.md

Include build, lint, tests, forms, mobile, desktop, accessibility, metadata, links, images, environment, security, database policies, domain, HTTPS, backup, and final approval.
