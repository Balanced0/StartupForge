import Link from "next/link";
import { House, Thunderbolt, ArrowRight } from "@gravity-ui/icons";

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-base-100 px-5 text-center">
      {/* Icon cluster */}
      <div className="relative mb-10">
        <div className="flex h-56 w-56 items-center justify-center rounded-full bg-primary/10">
          <div className="flex h-40 w-40 items-center justify-center rounded-full bg-primary/20">
            <span className="text-6xl font-extrabold text-primary">404</span>
          </div>
        </div>

        <div className="absolute -top-2 right-0 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 shadow-md">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
        </div>

        <div className="absolute bottom-8 -left-4 flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 shadow-md">
          <Thunderbolt className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Text */}
      <h1 className="text-3xl font-bold text-base-content">Page Not Found</h1>
      <p className="mt-4 max-w-md text-base text-base-content/50 leading-relaxed">
        Looks like this page went off-script. The URL may be broken or the page
        may have moved.
      </p>

      {/* Actions */}
      <Link
        href="/"
        className="mt-8 flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <House className="h-5 w-5" />
        Back to Home
      </Link>

      <Link
        href="/startups"
        className="mt-5 flex items-center gap-1 font-semibold text-primary transition hover:opacity-80"
      >
        Or browse startups
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
