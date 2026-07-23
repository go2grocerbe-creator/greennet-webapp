import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="eclipse-404">
      <div className="eclipse-404__orb" aria-hidden="true">
        <i />
      </div>
      <div className="eclipse-404__content">
        <p>404 / Eclipse</p>
        <h1>Page not found</h1>
        <p>The page you are looking for is outside this solar day.</p>
        <Link href="/">
          <ArrowLeft aria-hidden="true" />
          Return to the homepage
        </Link>
      </div>
    </main>
  );
}
