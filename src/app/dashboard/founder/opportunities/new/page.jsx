"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  CirclePlus,
  Clock,
  Calendar,
  Globe,
  PersonWorker,
  Code,
  Check,
  CircleDollar,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const WORK_TYPES = ["Remote", "On-site", "Hybrid"];
const COMMITMENT_LEVELS = ["Full-time", "Part-time", "Contract", "Internship"];

const emptyForm = {
  startup_id: "",
  role_title: "",
  required_skills: "",
  work_type: "Remote",
  commitment_level: "Part-time",
  deadline: "",
  compensation: "",
};

export default function AddOpportunityPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [startups, setStartups] = useState([]);
  const [loadingStartups, setLoadingStartups] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);

  // Premium gate state
  const [isPremium, setIsPremium] = useState(false);
  const [oppCount, setOppCount] = useState(0);
  const [checkingPremium, setCheckingPremium] = useState(true);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  };

  // Fetch startups
  useEffect(() => {
    const fetchStartups = async () => {
      if (!user?.email) return;
      setLoadingStartups(true);
      try {
        const res = await fetch(
          `${API_URL}/api/startups?founder_email=${user.email}`,
        );
        const data = await res.json();
        setStartups(data || []);
        if (data?.length > 0) {
          setForm((prev) => ({ ...prev, startup_id: data[0]._id }));
        }
      } catch {
        setError("Failed to load your startups.");
      } finally {
        setLoadingStartups(false);
      }
    };

    fetchStartups();
  }, [user?.email]);

  // Check premium status + opportunity count
  useEffect(() => {
    const checkPremium = async () => {
      if (!user?.email) return;
      try {
        const [premRes, totalOpps] = await Promise.all([
          fetch(`${API_URL}/api/payments/status/${user.email}`),
          fetch(`${API_URL}/api/startups?founder_email=${user.email}`)
            .then((r) => r.json())
            .then(async (fetchedStartups) => {
              const ids = fetchedStartups.map((s) => s._id);
              const counts = await Promise.all(
                ids.map((id) =>
                  fetch(`${API_URL}/api/opportunities?startup_id=${id}`)
                    .then((r) => r.json())
                    .then((d) => d.length),
                ),
              );
              return counts.reduce((a, b) => a + b, 0);
            }),
        ]);
        const premData = await premRes.json();
        setIsPremium(premData.isPremium);
        setOppCount(totalOpps);
      } catch {
      } finally {
        setCheckingPremium(false);
      }
    };
    checkPremium();
  }, [user?.email]);

  const handleUpgrade = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payments/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: user.email }),
      });
      const data = await res.json();
      window.location.href = data.url;
    } catch {
      setError("Failed to start checkout. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.startup_id ||
      !form.role_title ||
      !form.required_skills ||
      !form.deadline
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          compensation: form.compensation ? Number(form.compensation) : null,
          required_skills: form.required_skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error("Failed to create opportunity");

      setForm({
        ...emptyForm,
        startup_id: startups[0]?._id || "",
      });
      setOppCount((prev) => prev + 1);
      showToast();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Premium check loading
  if (checkingPremium) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Premium gate — show upgrade wall
  if (!isPremium && oppCount >= 3) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold text-base-content">
            Add Opportunity
          </h2>
          <p className="mt-1 text-sm text-base-content/50">
            Post a new role for collaborators to apply to
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 rounded-3xl border border-primary/20 bg-primary/5 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/15">
            <CircleDollar className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-base-content">
              Upgrade to Premium
            </h3>
            <p className="mt-2 max-w-sm text-sm text-base-content/60">
              You've used your 3 free opportunity posts. Upgrade to Premium for
              unlimited postings and more visibility.
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-4xl font-extrabold text-base-content">
              $49{" "}
              <span className="text-lg font-normal text-base-content/50">
                one-time
              </span>
            </p>
            <p className="text-xs text-base-content/40">
              Unlimited opportunities • Lifetime access
            </p>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleUpgrade}
            className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Upgrade Now — $49
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-xl transition-all duration-300 ${
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Opportunity posted!
          </p>
          <p className="text-xs text-gray-500">
            Collaborators can now apply to this role.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-base-content">
          Add Opportunity
        </h2>
        <p className="text-sm text-base-content/50">
          Post a new role for collaborators to apply to
        </p>
        {/* Free post counter */}
        {!isPremium && (
          <p className="mt-1 text-xs font-semibold text-amber-600">
            {3 - oppCount} free post{3 - oppCount !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>

      {/* Form card */}
      <div className="w-full rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm sm:p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Select Startup */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-base-content">
              Startup
            </label>
            {loadingStartups ? (
              <div className="h-12 animate-pulse rounded-xl bg-base-200" />
            ) : startups.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-base-300 px-4 py-3">
                <Briefcase className="h-4 w-4 text-base-content/40" />
                <p className="text-sm text-base-content/50">
                  No startups found.{" "}
                  <Link
                    href="/dashboard/founder/startup"
                    className="font-semibold text-primary hover:opacity-80"
                  >
                    Create one first →
                  </Link>
                </p>
              </div>
            ) : (
              <select
                value={form.startup_id}
                onChange={(e) =>
                  setForm({ ...form, startup_id: e.target.value })
                }
                className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none transition focus:border-primary"
                required
              >
                {startups.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.startup_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Role Title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-base-content">
              Role Title
            </label>
            <div className="relative">
              <PersonWorker className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                value={form.role_title}
                onChange={(e) =>
                  setForm({ ...form, role_title: e.target.value })
                }
                placeholder="e.g. Full-Stack Developer"
                className="w-full rounded-xl border border-base-300 bg-base-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Required Skills */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-base-content">
              Required Skills
            </label>
            <div className="relative">
              <Code className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                value={form.required_skills}
                onChange={(e) =>
                  setForm({ ...form, required_skills: e.target.value })
                }
                placeholder="e.g. React, Node.js, MongoDB"
                className="w-full rounded-xl border border-base-300 bg-base-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary"
                required
              />
            </div>
            <p className="text-xs text-base-content/40">
              Separate skills with commas
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Work Type */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-base-content">
                Work Type
              </label>
              <div className="flex flex-wrap gap-2">
                {WORK_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, work_type: type })}
                    className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      form.work_type === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-base-300 text-base-content/60 hover:border-base-content/30"
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Commitment Level */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-base-content">
                Commitment Level
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMITMENT_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, commitment_level: level })
                    }
                    className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      form.commitment_level === level
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-base-300 text-base-content/60 hover:border-base-content/30"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Compensation */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-base-content">
                Compensation{" "}
                <span className="font-normal text-base-content/40">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <CircleDollar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
                <input
                  type="number"
                  min="0"
                  value={form.compensation}
                  onChange={(e) =>
                    setForm({ ...form, compensation: e.target.value })
                  }
                  placeholder="e.g. 2000"
                  className="w-full rounded-xl border border-base-300 bg-base-100 py-3 pl-11 pr-16 text-sm outline-none transition focus:border-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-base-content/40">
                  USD / mo
                </span>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-base-content">
                Deadline
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-base-300 bg-base-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={submitting || loadingStartups || startups.length === 0}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <CirclePlus className="h-5 w-5" />
              {submitting ? "Posting..." : "Post Opportunity"}
            </button>
            <button
              type="button"
              onClick={() =>
                setForm({ ...emptyForm, startup_id: startups[0]?._id || "" })
              }
              className="flex items-center justify-center gap-2 rounded-2xl border border-base-300 px-6 py-3.5 font-semibold text-base-content/70 transition hover:bg-base-200"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
