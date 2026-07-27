# Claude Reimagination Implementation Plan

**Branch:** `feature/implement-claude-reimagination`  
**Design Reference:** `design-reference/claude-reimagination/content/`

## Overview

Translating Claude Design components (`.dc.html`) into production Next.js/React components, preserving existing architecture patterns.

## Design Tokens

### Colors (CSS variables in `src/app/globals.css`)
```css
--midnight-navy: #0D1B24;
--petrol-teal: #0C5A56;
--petrol-light: #147A74;
--petrol-dark: #084240;
--solar-amber: #F3B23F;
--amber-light: #F5C76A;
--amber-dark: #D99A2A;
--titanium-grey: #69757A;
--warm-white: #F5F2EA;
--light-grey: #9AA5A9;
--muted-grey: #5B6469;
--border-light: rgba(13, 27, 36, 0.08);
--border-lighter: rgba(13, 27, 36, 0.1);
--border-mobile-nav: rgba(245, 242, 234, 0.08);
--text-muted: rgba(201, 207, 209, 1);
```

### Typography
- **Display/Headings:** Space Grotesk 500–700, via `next/font/google`
- **Body/UI:** Inter 400–600, via `next/font/google`
- **Font setup:** `src/app/layout.tsx` (already uses `next/font/google`)

### Spacing & Layout
- **Border radius:** 2px (sharp, engineered feel)
- **Container max-width:** 1280px
- **Padding:** 24px (mobile), 64px–96px (sections)
- **Breakpoint for mobile nav:** 880px

## Implementation Phases

### Phase 1: Design Token & Layout Foundation
- [ ] Update `src/app/globals.css` with new color variables
- [ ] Verify fonts loaded via `next/font/google` in layout.tsx
- [ ] Create/update `src/components/ui/container.tsx` (1280px max-width)
- [ ] Create reusable button component variants (solid amber CTA, outline light)

### Phase 2: Shared Navigation & Footer
- [ ] Create `src/components/layout/site-header.tsx` (sticky, dark, responsive nav)
- [ ] Create `src/components/layout/site-footer.tsx` (4-column, dark)
- [ ] Update `src/app/layout.tsx` to include header/footer
- [ ] Test responsive at 880px breakpoint

### Phase 3: Homepage
- [ ] Implement `src/app/(marketing)/page.tsx`
  - Hero section (dark bg, 2-column grid, CTA + image)
  - System categories (7 cards with SVG icons)
  - "Why GreenNet" (6 numbered pillars)
  - Monitoring section (image + copy)
  - Customer journey (6 steps with color bars)
  - Applications (2 cards: commercial & residential)
  - CTA section
- [ ] Placeholder images in `public/images/`

### Phase 4: Product Pages
- [ ] Update `src/app/(marketing)/products/page.tsx`
  - Category filter tabs (client-side)
  - 7-category product grid
  - Product cards with image, category tag, name, description
- [ ] Create `src/app/(marketing)/products/[slug]/page.tsx`
  - Product detail template
  - Specifications table
  - Related products grid
- [ ] Seed mock products (or use existing ProductService)

### Phase 5: New Routes
- [ ] Create `src/app/(marketing)/solutions/page.tsx`
  - Commercial & Industrial section
  - Residential & Estates section
  - Use-case cards with images
- [ ] Create `src/app/(marketing)/projects/page.tsx`
  - Capability rows (sector + scope descriptions, no fabricated outcomes)
  - Support timeline
- [ ] Create `src/app/(marketing)/monitoring/page.tsx`
  - 4-up grid of support/monitoring stages
  - Feature callouts
- [ ] Create `src/app/(marketing)/about/page.tsx` (or update existing)
- [ ] Create `src/app/(marketing)/quote/page.tsx`
  - 13-field consultative form (contact, project, message groups)
  - Client-side validation
  - Local success state (no backend call)

### Phase 6: Contact Page
- [ ] Update `src/app/(marketing)/contact/page.tsx`
  - Contact details (phone, email, address—marked as pending)
  - General enquiry form
  - Keep existing pattern/validation

### Phase 7: Images & Assets
- [ ] Copy 17 placeholder images to `public/images/greennet/`
- [ ] Document in README that these are AI-generated placeholders
- [ ] Add alt text to all images
- [ ] Verify aspect ratios (hero 4:5, dashboard 16:11, app cards 4:3, etc.)

### Phase 8: Responsive & Accessibility
- [ ] Test at: 375px, 430px, 768px, 1024px, 1440px
- [ ] Verify:
  - Semantic HTML (correct heading hierarchy)
  - Keyboard navigation
  - Focus styles (visible 2px outlines)
  - Touch targets ≥44px
  - Form labels properly associated
  - `prefers-reduced-motion` respected
  - No horizontal overflow
  - Mobile nav accessible

### Phase 9: Validation & QA
- [ ] Run:
  ```bash
  npm run lint
  npm run typecheck
  npm run build
  npm run test (if applicable)
  ```
- [ ] Browser inspection:
  - All routes load
  - No console errors
  - Images render correctly
  - Forms work (client-side validation)
  - Layout stable at all breakpoints
  - Colors match design
  - Typography matches
- [ ] Check for fabricated claims (none should be published)
- [ ] Verify no backend/DB/credentials added

## File Structure

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                 [HOME]
│   │   ├── layout.tsx               (or kept in root layout)
│   │   ├── about/
│   │   │   └── page.tsx             [NEW]
│   │   ├── products/
│   │   │   ├── page.tsx             [UPDATE]
│   │   │   └── [slug]/
│   │   │       └── page.tsx         [UPDATE/CREATE]
│   │   ├── solutions/
│   │   │   └── page.tsx             [NEW]
│   │   ├── projects/
│   │   │   └── page.tsx             [NEW]
│   │   ├── monitoring/
│   │   │   └── page.tsx             [NEW]
│   │   ├── quote/
│   │   │   └── page.tsx             [NEW]
│   │   └── contact/
│   │       └── page.tsx             [UPDATE]
│   ├── globals.css                  [UPDATE: colors, fonts]
│   └── layout.tsx                   [UPDATE: add Header/Footer]
├── components/
│   ├── layout/
│   │   ├── site-header.tsx          [NEW]
│   │   └── site-footer.tsx          [NEW]
│   ├── ui/
│   │   ├── container.tsx            [VERIFY]
│   │   ├── button.tsx               [UPDATE: amber variant]
│   │   └── ...
│   └── marketing/
│       ├── product-card.tsx         [NEW]
│       ├── category-filter.tsx      [NEW]
│       ├── capability-row.tsx       [NEW]
│       └── ...
└── ...

public/
└── images/
    └── greennet/                    [NEW: 17 placeholder images]
```

## Constraints

- **Do not create:** Backend, database, auth, CMS, ecommerce, production APIs
- **Preserve:** Next.js App Router, TypeScript, existing mocks, ProductService pattern
- **Content:** Keep unresolved fields marked; source from Brand Book; no invented claims
- **Placeholders:** Clearly document as AI-generated; mark pending approvals

## Commits (Logical order)

1. `docs: add Claude design reference to design-reference/claude-reimagination`
2. `feat: update design tokens and typography`
3. `feat: implement site header and footer`
4. `feat: implement homepage`
5. `feat: implement product discovery and detail pages`
6. `feat: implement solutions, projects, and monitoring pages`
7. `feat: implement about, quote, and contact pages`
8. `feat: add placeholder images`
9. `fix: refine responsive and accessible behavior`
10. `docs: document design reference and placeholder status`

## Validation Checklist

- [ ] All routes render without errors
- [ ] No console errors/warnings
- [ ] Responsive at 375, 430, 768, 1024, 1440px
- [ ] Keyboard navigation works
- [ ] Focus styles visible
- [ ] Forms submit (local state)
- [ ] Images load and display correctly
- [ ] No hardcoded business records in UI
- [ ] No backend/DB/auth added
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds

## Known Issues / Placeholders

- Logo mark: wordmark only (no brand mark file)
- All photography: AI-generated placeholders
- Contact details: pending approval
- Product specs: pending approval
- Legal pages: links only, not implemented
- Claims requiring approval: flagged inline in code
