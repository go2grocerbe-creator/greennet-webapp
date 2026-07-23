"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const SCRIPT_ID = "cf-turnstile-script";

type TurnstileWidgetProps = {
  siteKey?: string;
  onVerify: (token: string) => void;
};

/**
 * If `siteKey` is configured, loads the official Cloudflare script and
 * renders a real widget. If not (current state — no Turnstile account
 * yet), renders a neutral notice and never calls `onVerify`; the
 * server-side dev bypass (src/lib/turnstile/verify.ts) is the actual
 * safety net in that state — this component never fakes a token.
 */
export function TurnstileWidget({ siteKey, onVerify }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useId();

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let mounted = true;
    let renderedWidgetId: string | undefined;

    function render() {
      if (!mounted || !containerRef.current || !window.turnstile) return;
      renderedWidgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey!,
        callback: onVerify,
      });
    }

    if (window.turnstile) {
      render();
    } else if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    } else {
      document.getElementById(SCRIPT_ID)?.addEventListener("load", render);
    }

    return () => {
      mounted = false;
      if (renderedWidgetId) window.turnstile?.remove(renderedWidgetId);
    };
  }, [siteKey, onVerify]);

  if (!siteKey) {
    return (
      <p className="text-muted-foreground text-xs" data-testid="turnstile-unconfigured">
        Verification is not configured in this environment.
      </p>
    );
  }

  return <div ref={containerRef} id={`turnstile-${widgetId}`} />;
}
