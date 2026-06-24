"use client";

import { useEffect, useState, useCallback } from "react";
import { Magnifier, Xmark, Funnel, Briefcase } from "@gravity-ui/icons";
import OpportunityCard from "@/components/OpportunityCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const WORK_TYPES = ["All", "Remote", "On-site", "Hybrid"];
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
const LIMIT = 9;

export default function BrowseOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [workType, setWorkType] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [workType, industry]);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (workType !== "All") params.set("work_type", workType);
      if (industry !== "All") params.set("industry", industry);

      const res = await fetch(`${API_URL}/api/opportunities/browse?${params}`);
      const data = await res.json();
      setOpportunities(data.opportunities || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, workType, industry, page]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const clearFilters = () => {
    setSearch("");
    setWorkType("All");
    setIndustry("All");
    setPage(1);
  };

  const hasFilters =
    debouncedSearch || workType !== "All" || industry !== "All";

  return (
    <section className="min-h-screen bg-base-200/40 px-5 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-base-content">
            Browse Opportunities
          </h1>
          <p className="mt-2 text-base text-base-content/50">
            Find the perfect role to join a startup you believe in.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Magnifier className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role title or skill..."
              className="w-full rounded-2xl border border-base-300 bg-base-100 py-3.5 pl-11 pr-10 text-sm shadow-sm outline-none transition focus:border-primary"
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

          {/* Work Type */}
          <div className="relative">
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className={`appearance-none cursor-pointer rounded-2xl border py-3.5 pl-4 pr-9 text-sm font-medium shadow-sm outline-none transition ${
                workType !== "All"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-base-300 bg-base-100 text-base-content/70"
              }`}
            >
              {WORK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Work Types" : t}
                </option>
              ))}
            </select>
            <Funnel className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-base-content/40" />
          </div>

          {/* Industry */}
          <div className="relative">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={`appearance-none cursor-pointer rounded-2xl border py-3.5 pl-4 pr-9 text-sm font-medium shadow-sm outline-none transition ${
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
            <Funnel className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-base-content/40" />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-2xl border border-base-300 px-4 py-3.5 text-sm font-semibold text-base-content/60 transition hover:border-red-300 hover:text-red-500"
            >
              <Xmark className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="mb-6 text-sm text-base-content/50">
            {total === 0
              ? "No opportunities found"
              : `${total} opportunit${total !== 1 ? "ies" : "y"} found`}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-3xl bg-base-200"
              />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-4 font-semibold text-base-content">
              No opportunities match your search
            </p>
            <p className="mt-1 text-sm text-base-content/50">
              Try adjusting your filters or search term.
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-5 flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
              >
                <Xmark className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp._id} opportunity={opp} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-base-300 px-4 py-2.5 text-sm font-semibold text-base-content/70 transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-base-300 disabled:hover:text-base-content/70"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 1 && p <= page + 1),
                )
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`dot-${i}`}
                      className="px-2 text-sm text-base-content/40"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${
                        page === p
                          ? "bg-primary text-white"
                          : "border border-base-300 text-base-content/70 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-base-300 px-4 py-2.5 text-sm font-semibold text-base-content/70 transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-base-300 disabled:hover:text-base-content/70"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
