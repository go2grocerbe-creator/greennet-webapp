import Link from "next/link";
import { ArrowRight } from "lucide-react";

type PublicDataStateProps = {
  kind: "services" | "products";
  status: "unavailable" | "empty";
};

export function PublicDataState({ kind, status }: PublicDataStateProps) {
  const label = kind === "services" ? "Solar Solutions" : "Products";
  const title =
    status === "unavailable"
      ? "The catalogue is between connections."
      : "Nothing is published here yet.";
  const detail =
    status === "unavailable"
      ? `${label} information cannot be loaded right now. You can still send an enquiry or contact GreenNet directly.`
      : `${label} will appear here after GreenNet publishes them. You can contact the team in the meantime.`;

  return (
    <section className="public-data-state" aria-labelledby={`${kind}-${status}-title`}>
      <div className="public-data-state__signal" aria-hidden="true">
        <span>00</span>
        <i />
      </div>
      <div>
        <p>{status === "unavailable" ? "Data unavailable" : "Awaiting publication"}</p>
        <h2 id={`${kind}-${status}-title`}>{title}</h2>
        <p>{detail}</p>
        <Link href="/contact">
          Send an enquiry <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
