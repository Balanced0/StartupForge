"use client";

import Link from "next/link";
import { Thunderbolt, Target, ShieldCheck, Medal } from "@gravity-ui/icons";
import { motion } from "motion/react";

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
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Why StartupForge?
          </h2>
          <p className="text-white/70 text-base max-w-md mx-auto leading-relaxed">
            We built the platform we always wished existed for finding the right
            startup team.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm flex flex-col gap-5 transition-shadow duration-300 overflow-hidden hover:shadow-[inset_0_0_35px_rgba(255,255,255,0.15)]"
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100 bg-white/5 pointer-events-none" />

              <motion.div
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"
                initial={{ scale: 0.7, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.1 + 0.2,
                  ease: "easeOut",
                }}
              >
                {feature.icon}
              </motion.div>

              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-white text-base">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-indigo-600 transition hover:bg-white/90"
            >
              Join StartupForge Today
              <span>→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
