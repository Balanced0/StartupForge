"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Tag,
  Persons,
  Briefcase,
  Calendar,
  Clock,
  CircleDollar,
  Check,
  Xmark,
  CircleExclamation,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function ApplyModal({ opportunity, startup, user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    portfolio_link: "",
    motivation_message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.portfolio_link || !form.motivation_message) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: opportunity._id,
          applicant_email: user.email,
          portfolio_link: form.portfolio_link,
          motivation_message: form.motivation_message,
          startup_name: startup.startup_name,
          opportunity_name: opportunity.role_title,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }
      onSuccess();
    } catch {
      setError("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-base-200 bg-base-100 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl text-base-content/50 transition hover:bg-base-200"
        >
          <Xmark className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-primary mb-0.5">
            {startup.startup_name}
          </p>
          <h3 className="text-xl font-bold text-base-content">
            Apply for {opportunity.role_title}
          </h3>
          <p className="mt-1 text-xs text-base-content/50">
            Fill in your details below — we'll send your application to the
            founder.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Portfolio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-base-content">
              Portfolio / LinkedIn URL
            </label>
            <input
              type="url"
              value={form.portfolio_link}
              onChange={(e) =>
                setForm({ ...form, portfolio_link: e.target.value })
              }
              placeholder="https://yourportfolio.com"
              className="w-full rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none transition focus:border-primary"
              required
            />
          </div>

          {/* Motivation */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-base-content">
              Why do you want to join?
            </label>
            <textarea
              rows={5}
              value={form.motivation_message}
              onChange={(e) =>
                setForm({ ...form, motivation_message: e.target.value })
              }
              placeholder="Tell the founder what excites you about this role and what you bring to the table..."
              className="w-full resize-none rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-primary"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-xs text-red-600">
              <CircleExclamation className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-base-300 px-5 py-3.5 text-sm font-semibold text-base-content/70 transition hover:bg-base-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PositionCard({ opportunity, startup, user, onApply }) {
  const isCollaborator = user?.role === "collaborator";
  const deadlineDate = opportunity.deadline
    ? new Date(opportunity.deadline)
    : null;
  const isExpiringSoon =
    deadlineDate &&
    (deadlineDate - new Date()) / (1000 * 60 * 60 * 24) <= 7;

  return (
    <div className="group rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {startup.logo ? (
            <img
              src={startup.logo}
              alt={startup.startup_name}
              className="h-10 w-10 flex-shrink-0 rounded-xl object-cover ring-2 ring-base-200"
            />
          ) : (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
              {startup.startup_name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="font-bold text-base-content">
              {opportunity.role_title}
            </h4>
            <p className="text-xs font-semibold text-primary">
              {startup.startup_name}
            </p>
          </div>
        </div>

        {isExpiringSoon && (
          <span className="flex-shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
            Closing soon
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {opportunity.commitment_level && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {opportunity.commitment_level}
          </span>
        )}
        {opportunity.work_type && (
          <span className="flex items-center gap-1 rounded-full border border-base-300 px-2.5 py-0.5 text-xs text-base-content/60">
            <Globe className="h-3 w-3" />
            {opportunity.work_type}
          </span>
        )}
      </div>

      {/* Skills */}
      {opportunity.required_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {opportunity.required_skills.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="flex items-center gap-1 rounded-full bg-base-200 px-2.5 py-0.5 text-xs font-medium text-base-content/70"
            >
              <Tag className="h-2.5 w-2.5" />
              {skill}
            </span>
          ))}
          {opportunity.required_skills.length > 4 && (
            <span className="rounded-full bg-base-200 px-2.5 py-0.5 text-xs font-medium text-base-content/50">
              +{opportunity.required_skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-base-200 pt-4">
        <div className="flex items-center gap-3 text-xs text-base-content/50">
          {opportunity.compensation ? (
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <CircleDollar className="h-3.5 w-3.5" />
              ${opportunity.compensation.toLocaleString()} / mo
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <CircleDollar className="h-3.5 w-3.5" />
              Equity / Unpaid
            </span>
          )}
          {deadlineDate && (
            <span
              className={`flex items-center gap-1 ${
                isExpiringSoon ? "text-red-500" : ""
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              {deadlineDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Apply button — only enabled for collaborators */}
        <div className="relative group/btn">
          <button
            onClick={() => isCollaborator && onApply(opportunity)}
            disabled={!isCollaborator}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isCollaborator
                ? "bg-primary text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                : "cursor-not-allowed bg-base-200 text-base-content/40"
            }`}
          >
            Apply Now
          </button>
          {/* Tooltip for non-collaborators */}
          {!isCollaborator && (
            <div className="pointer-events-none absolute -top-10 right-0 z-10 hidden w-max max-w-[200px] rounded-xl bg-base-content px-3 py-1.5 text-center text-xs text-base-100 shadow-lg group-hover/btn:block">
              {!user
                ? "Sign in as a collaborator to apply"
                : "Only collaborators can apply"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StartupDetailPage() {
  const { id } = useParams();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [startup, setStartup] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [startupRes, oppsRes] = await Promise.all([
          fetch(`${API_URL}/api/startups/${id}`),
          fetch(`${API_URL}/api/opportunities?startup_id=${id}`),
        ]);
        const startupData = await startupRes.json();
        const oppsData = await oppsRes.json();
        setStartup(startupData);
        setOpportunities(
          (oppsData || []).filter((o) => o.status === "open")
        );
      } catch {
        setStartup(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApplySuccess = () => {
    setSelectedOpp(null);
    showToast("success", "Application submitted! Good luck 🎉");
  };

  if (loading) {
    return (
      <section className="min-h-screen px-5 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-5 w-32 animate-pulse rounded-full bg-base-200" />
          <div className="h-52 animate-pulse rounded-3xl bg-base-200 mb-6" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="h-48 animate-pulse rounded-3xl bg-base-200" />
              <div className="h-36 animate-pulse rounded-3xl bg-base-200" />
            </div>
            <div className="h-56 animate-pulse rounded-3xl bg-base-200" />
          </div>
        </div>
      </section>
    );
  }

  if (!startup) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-2xl font-bold text-base-content">
          Startup not found
        </p>
        <Link
          href="/startups"
          className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Startups
        </Link>
      </section>
    );
  }

  const foundedYear = startup.createdAt
    ? new Date(startup.createdAt).getFullYear()
    : "—";

  return (
    <>
      {/* ── Toast ── */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-xl transition-all duration-300 ${
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        } ${
          toast?.type === "success"
            ? "border-emerald-200 bg-white"
            : "border-red-200 bg-white"
        }`}
      >
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
            toast?.type === "success" ? "bg-emerald-100" : "bg-red-100"
          }`}
        >
          {toast?.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <CircleExclamation className="h-4 w-4 text-red-600" />
          )}
        </div>
        <p className="text-sm font-semibold text-gray-900">{toast?.message}</p>
      </div>

      {/* ── Apply Modal ── */}
      {selectedOpp && (
        <ApplyModal
          opportunity={selectedOpp}
          startup={startup}
          user={user}
          onClose={() => setSelectedOpp(null)}
          onSuccess={handleApplySuccess}
        />
      )}

      <section className="min-h-screen px-5 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Back link */}
          <Link
            href="/startups"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-base-content/60 transition hover:text-base-content"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Startups
          </Link>

          {/* ── Hero Banner ── */}
          <div className="relative mb-2 rounded-3xl">
            {/* Background */}
            <div className="h-52 overflow-hidden rounded-3xl bg-gradient-to-br from-primary/30 via-indigo-200/60 to-purple-200/60">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 25% 50%, rgba(99,102,241,0.4) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.3) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(59,130,246,0.2) 0%, transparent 50%)",
                }}
              />
            </div>

            {/* Logo */}
            <div className="absolute bottom-0 left-6 translate-y-1/2">
              {startup.logo ? (
                <img
                  src={startup.logo}
                  alt={startup.startup_name}
                  className="h-20 w-20 rounded-2xl object-cover shadow-lg ring-4 ring-base-100"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-extrabold text-white shadow-lg ring-4 ring-base-100">
                  {startup.startup_name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* ── Identity Row ── */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 pt-12 pl-6">
            <div>
              <h1 className="text-3xl font-extrabold text-base-content">
                {startup.startup_name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {startup.industry && (
                  <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-semibold text-primary">
                    <Tag className="h-3 w-3" />
                    {startup.industry}
                  </span>
                )}
                {startup.funding_stage && (
                  <span className="rounded-full border border-base-300 px-3 py-0.5 text-xs font-semibold text-base-content/60">
                    {startup.funding_stage}
                  </span>
                )}
                {startup.status === "active" && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-600">
                    ✓ Verified
                  </span>
                )}
                {startup.founder_email && (
                  <span className="flex items-center gap-1 text-xs text-base-content/50">
                    <Persons className="h-3.5 w-3.5" />
                    {startup.founder_email}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`mailto:${startup.founder_email}`}
                className="flex items-center gap-1.5 rounded-2xl border border-base-300 px-4 py-2.5 text-sm font-semibold text-base-content/70 transition hover:border-primary hover:text-primary"
              >
                <Globe className="h-4 w-4" />
                Contact
              </a>
              <a
                href={`#positions`}
                className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Briefcase className="h-4 w-4" />
                View All Roles
              </a>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: About + Positions */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* About */}
              <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-bold text-base-content">
                  About {startup.startup_name}
                </h2>
                <p className="text-sm leading-relaxed text-base-content/70">
                  {startup.description || "No description provided."}
                </p>

                {/* Tags */}
                {startup.industry && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-base-200 bg-base-200/60 px-3 py-0.5 text-xs font-medium text-base-content/60">
                      {startup.industry}
                    </span>
                    {startup.funding_stage && (
                      <span className="rounded-full border border-base-200 bg-base-200/60 px-3 py-0.5 text-xs font-medium text-base-content/60">
                        {startup.funding_stage}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Open Positions */}
              <div id="positions">
                <h2 className="mb-4 text-lg font-bold text-base-content">
                  Open Positions ({opportunities.length})
                </h2>

                {opportunities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 py-14 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <p className="mt-3 font-semibold text-base-content">
                      No open positions right now
                    </p>
                    <p className="mt-1 text-sm text-base-content/50">
                      Check back later for new opportunities.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {opportunities.map((opp) => (
                      <PositionCard
                        key={opp._id}
                        opportunity={opp}
                        startup={startup}
                        user={user}
                        onApply={setSelectedOpp}
                      />
                    ))}
                  </div>
                )}

                {/* Role-gate notice */}
                {!user && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    <CircleExclamation className="h-4 w-4 flex-shrink-0" />
                    <span>
                      <Link
                        href="/sign-in"
                        className="font-semibold underline underline-offset-2"
                      >
                        Sign in
                      </Link>{" "}
                      as a collaborator to apply for these roles.
                    </span>
                  </div>
                )}
                {user && user.role !== "collaborator" && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    <CircleExclamation className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Only collaborator accounts can apply for positions.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Quick Facts + Similar */}
            <div className="flex flex-col gap-6">
              {/* Quick Facts */}
              <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-base-content">
                  Quick Facts
                </h3>
                <dl className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-base-content/50">Founded</dt>
                    <dd className="font-bold text-base-content">
                      {foundedYear}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-base-content/50">Team Size Needed</dt>
                    <dd className="font-bold text-base-content">
                      {opportunities.length > 0
                        ? `${opportunities.length} role${opportunities.length !== 1 ? "s" : ""}`
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-base-content/50">Stage</dt>
                    <dd className="font-bold text-base-content">
                      {startup.funding_stage || "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-base-content/50">Open Roles</dt>
                    <dd className="font-bold text-primary">
                      {opportunities.length}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-base-content/50">Founder</dt>
                    <dd
                      className="font-semibold text-base-content truncate max-w-[140px] text-right"
                      title={startup.founder_email}
                    >
                      {startup.founder_email?.split("@")[0] || "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Role breakdown */}
              {opportunities.length > 0 && (
                <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                  <h3 className="mb-4 font-bold text-base-content">
                    Roles Overview
                  </h3>
                  <div className="flex flex-col gap-2">
                    {opportunities.map((opp) => (
                      <a
                        key={opp._id}
                        href="#positions"
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-primary/5"
                      >
                        <span className="text-sm font-medium text-base-content group-hover:text-primary truncate">
                          {opp.role_title}
                        </span>
                        <span className="ml-2 flex-shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {opp.commitment_level || "Open"}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
