"use client";

import { useEffect } from "react";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry wiring is an integration point, not yet configured — see
    // docs/architecture.md "Integration points".
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred loading this page. Try again, or return to the homepage.
      </p>
      <Button onClick={reset}>Try again</Button>
    </Container>
  );
}
