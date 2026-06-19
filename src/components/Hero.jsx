import Link from "next/link";
import { Rocket, Suitcase, ArrowRight } from "@gravity-ui/icons";

const stats = [
  { value: "2,400+", label: "Active Startups" },
  { value: "18,000+", label: "Collaborators" },
  { value: "940+", label: "Successful Teams" },
  { value: "5,200+", label: "Opportunities" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#07070d]">
      {/* Big glows */}
      <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-primary/30 blur-[140px]" />
      <div className="absolute top-20 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/25 blur-[140px]" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[130px]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-36 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 backdrop-blur-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-semibold text-primary/90">
            Backed by founders, built for founders
          </span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto mt-10 max-w-5xl text-6xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl">
          Find Your{" "}
          <span className="bg-gradient-to-r from-primary via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Dream Team
          </span>
          , Build the Next Big Thing
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/50 sm:text-xl">
          StartupForge connects visionary founders with elite developers,
          designers, and marketers who are ready to build something
          extraordinary together.
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/opportunities"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-indigo-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.7)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_55px_-8px_rgba(99,102,241,0.9)]"
          >
            <Suitcase className="h-5 w-5" />
            Browse Opportunities
          </Link>

          <Link
            href="/post"
            className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:text-primary"
          >
            Post Your Startup
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-24 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white/[0.08]"
            >
              <p className="bg-gradient-to-r from-primary to-indigo-300 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
