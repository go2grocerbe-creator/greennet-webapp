import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * Foundation placeholder only. No approved marketing copy exists yet —
 * see docs/requirements-register.md §5. Real Home content is built once
 * client discovery is confirmed and the CMS-backed `services`/`projects`
 * content is available.
 */
export default function HomePage() {
  return (
    <Container className="py-24">
      <SectionHeading
        eyebrow="Unapproved placeholder"
        title="GreenNet Energy — production site foundation"
        description="This page is a structural placeholder. Copy is intentionally neutral pending confirmed content — see docs/requirements-register.md §5."
      />
    </Container>
  );
}
