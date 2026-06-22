"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CirclePlus,
  Clock,
  Calendar,
  Globe,
  PersonWorker,
  Code,
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
};

export default function AddOpportunityPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [startups, setStartups] = useState([]);
  const [loadingStartups, setLoadingStartups] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
          required_skills: form.required_skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error("Failed to create opportunity");

      router.push("/dashboard/founder/opportunities");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-base-content">
          Add Opportunity
        </h2>
        <p className="mt-1 text-sm text-base-content/50">
          Post a new role for collaborators to apply to
        </p>
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
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border border-base-300 bg-base-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary"
                required
              />
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
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 rounded-2xl border border-base-300 px-6 py-3.5 font-semibold text-base-content/70 transition hover:bg-base-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
