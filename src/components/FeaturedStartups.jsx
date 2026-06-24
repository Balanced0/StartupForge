"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@gravity-ui/icons";
import StartupCard from "./StartupCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FeaturedStartups() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_URL}/api/startups/featured`);
        const data = await res.json();
        setStartups(data || []);
      } catch {
        setStartups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="bg-base-100 py-24 px-5">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-primary">
              Discover
            </span>
            <h2 className="mt-2 text-4xl font-bold text-base-content">
              Featured Startups
            </h2>
          </div>
          <Link
            href="/startups"
            className="flex items-center gap-1.5 rounded-2xl border border-base-300 px-5 py-2.5 text-sm font-semibold text-base-content/70 transition hover:border-primary hover:text-primary"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-3xl bg-base-200"
              />
            ))}
          </div>
        ) : startups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 py-16 text-center">
            <p className="text-base-content/50 text-sm">
              No featured startups yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map((startup) => (
              <StartupCard key={startup._id} startup={startup} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
