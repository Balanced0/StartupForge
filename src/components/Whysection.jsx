import Link from "next/link";
import { Thunderbolt, Target, ShieldCheck, Medal } from "@gravity-ui/icons";

const features = [
  {
    icon: <Thunderbolt className="h-5 w-5 text-white" />,
    title: "Find Fast",
    description:
      "Smart matching connects you with the right people in days, not months of searching.",
  },
  {
    icon: <Target className="h-5 w-5 text-white" />,
    title: "Vetted Quality",
    description:
      "Every profile is reviewed for quality and authenticity before going live.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-white" />,
    title: "Safe & Secure",
    description:
      "Secure messaging, agreements, and payment protection built into the platform.",
  },
  {
    icon: <Medal className="h-5 w-5 text-white" />,
    title: "Success Driven",
    description:
      "Dedicated support and resources to help your founding team thrive long-term.",
  },
];

export default function WhySection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 py-24 px-5">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why StartupForge?
          </h2>
          <p className="text-white/70 text-base max-w-md mx-auto leading-relaxed">
            We built the platform we always wished existed for finding the right
            startup team.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm flex flex-col gap-5 transition-all duration-300 overflow-hidden hover:shadow-[inset_0_0_35px_rgba(255,255,255,0.15)]"
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100 bg-white/5 pointer-events-none" />

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                {feature.icon}
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-white text-base">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-indigo-600 transition hover:bg-white/90"
          >
            Join StartupForge Today
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
