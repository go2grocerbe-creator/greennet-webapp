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
 * renders a real widget. Otherwise it renders nothing and never invents a
 * token. The server rejects unconfigured production submissions; the absent
 * widget therefore cannot create an unsecured production path.
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
    return null;
  }

  return <div ref={containerRef} id={`turnstile-${widgetId}`} />;
}
