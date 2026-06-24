"use client";

import { useEffect, useState, useCallback } from "react";
import { Magnifier, Funnel, Xmark, Briefcase } from "@gravity-ui/icons";
import StartupCard from "@/components/StartupCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FUNDING_STAGES = [
  "All",
  "Idea",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B+",
  "Bootstrapped",
];

const INDUSTRIES = [
  "All",
  "FinTech",
  "HealthTech",
  "EdTech",
  "CleanTech",
  "E-commerce",
  "AI/ML",
  "SaaS",
  "Web3",
  "Other",
];

export default function BrowseStartupsPage() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [fundingStage, setFundingStage] = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStartups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (industry !== "All") params.set("industry", industry);
      if (fundingStage !== "All") params.set("funding_stage", fundingStage);

      const res = await fetch(
        `${API_URL}/api/startups/browse?${params.toString()}`,
      );
      const data = await res.json();
      setStartups(data || []);
    } catch {
      setStartups([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, industry, fundingStage]);

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  const clearFilters = () => {
    setSearch("");
    setIndustry("All");
    setFundingStage("All");
  };

  const hasFilters =
    debouncedSearch || industry !== "All" || fundingStage !== "All";

  return (
    <section className="min-h-screen px-5 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-base-content">
            Browse Startups
          </h1>
          <p className="mt-2 text-base text-base-content/50">
            Discover innovative startups looking for talented collaborators.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Magnifier className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search startups by name or description..."
              className="w-full rounded-2xl border border-base-300 bg-base-100 py-3.5 pl-11 pr-10 text-sm outline-none transition focus:border-primary shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                <Xmark className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Industry filter */}
          <div className="relative w-full sm:w-auto">
            <Funnel className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-base-content/40" />
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={`w-full sm:w-auto appearance-none cursor-pointer rounded-2xl border py-3.5 pl-4 pr-10 text-sm font-medium outline-none transition shadow-sm ${
                industry !== "All"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-base-300 bg-base-100 text-base-content/70"
              }`}
            >
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i === "All" ? "All Industries" : i}
                </option>
              ))}
            </select>
          </div>

          {/* Funding stage filter */}
          <div className="relative w-full sm:w-auto">
            <Funnel className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-base-content/40" />
            <select
              value={fundingStage}
              onChange={(e) => setFundingStage(e.target.value)}
              className={`w-full sm:w-auto appearance-none cursor-pointer rounded-2xl border py-3.5 pl-4 pr-10 text-sm font-medium outline-none transition shadow-sm ${
                fundingStage !== "All"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-base-300 bg-base-100 text-base-content/70"
              }`}
            >
              {FUNDING_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Stages" : s}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-2xl border border-base-300 px-4 py-3.5 text-sm font-semibold text-base-content/60 transition hover:border-red-300 hover:text-red-500"
            >
              <Xmark className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="mb-6 text-sm text-base-content/50">
            {startups.length === 0
              ? "No startups found"
              : `${startups.length} startup${startups.length !== 1 ? "s" : ""} found`}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-3xl bg-base-200"
              />
            ))}
          </div>
        ) : startups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-4 font-semibold text-base-content">
              No startups match your search
            </p>
            <p className="mt-1 text-sm text-base-content/50">
              Try adjusting your filters or search term.
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-5 flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Xmark className="h-4 w-4" />
                Clear filters
              </button>
            )}
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
