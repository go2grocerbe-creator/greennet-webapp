"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="solar-error" aria-labelledby="solar-error-title">
      <div className="solar-error__sun" aria-hidden="true" />
      <div>
        <p>Dusk / interrupted</p>
        <h1 id="solar-error-title">This scene did not load.</h1>
        <p>
          An unexpected error interrupted the page. Try the scene again or return to the homepage.
        </p>
        <div>
          <Button onClick={reset} size="lg">
            Try again
          </Button>
          <Button render={<Link href="/" />} nativeButton={false} size="lg" variant="ghost">
            Go home
          </Button>
        </div>
      </div>
    </section>
  );
}
