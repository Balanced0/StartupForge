"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@gravity-ui/icons";
import OpportunityCard from "./OpportunityCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FeaturedOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/api/opportunities/featured`);
        const data = await res.json();
        setOpportunities((data || []).slice(0, 3));
      } catch {
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  return (
    <section className="py-24 px-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-primary">
              Latest Roles
            </span>
            <h2 className="mt-2 text-4xl font-bold text-base-content">
              Featured Opportunities
            </h2>
          </div>
          <Link
            href="/opportunities"
            className="flex items-center gap-1.5 rounded-2xl border border-base-300 px-5 py-2.5 text-sm font-semibold text-base-content/70 transition hover:border-primary hover:text-primary"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-3xl bg-base-200"
              />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 py-16 text-center">
            <p className="text-sm text-base-content/50">
              No open opportunities yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp._id} opportunity={opp} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
