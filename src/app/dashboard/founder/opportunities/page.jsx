"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CirclePlus,
  Pencil,
  TrashBin,
  Tag,
  Clock,
  Calendar,
  Globe,
  CircleDollar,
  Xmark,
  Check,
  Eye,
  Funnel,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const WORK_TYPES = ["Remote", "On-site", "Hybrid"];
const COMMITMENT_LEVELS = ["Full-time", "Part-time", "Contract", "Internship"];

const STATUS_STYLES = {
  open: "bg-emerald-100 text-emerald-700",
  closed: "bg-red-100 text-red-700",
  paused: "bg-amber-100 text-amber-700",
};

const emptyForm = {
  role_title: "",
  required_skills: "",
  work_type: "Remote",
  commitment_level: "Part-time",
  deadline: "",
  compensation: "",
};

export default function ManageOpportunitiesPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [opportunities, setOpportunities] = useState([]);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // fetch founder's startups (for name lookup)
  useEffect(() => {
    const fetchStartups = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch(
          `${API_URL}/api/startups?founder_email=${user.email}`,
        );
        const data = await res.json();
        setStartups(data || []);
      } catch {}
    };
    fetchStartups();
  }, [user?.email]);

  // fetch all opportunities for this founder's startups
  const fetchOpportunities = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const startupsRes = await fetch(
        `${API_URL}/api/startups?founder_email=${user.email}`,
      );
      const startupsData = await startupsRes.json();
      const ids = (startupsData || []).map((s) => s._id);

      if (ids.length === 0) {
        setOpportunities([]);
        return;
      }

      // fetch opportunities for all startup ids
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`${API_URL}/api/opportunities?startup_id=${id}`).then((r) =>
            r.json(),
          ),
        ),
      );
      setOpportunities(results.flat());
    } catch {
      setError("Failed to load opportunities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [user?.email]);

  const getStartupName = (startup_id) => {
    const s = startups.find(
      (s) => s._id === startup_id || s._id?.toString() === startup_id,
    );
    return s?.startup_name || "Unknown Startup";
  };

  const handleEdit = (opp) => {
    setForm({
      role_title: opp.role_title,
      required_skills: Array.isArray(opp.required_skills)
        ? opp.required_skills.join(", ")
        : opp.required_skills || "",
      work_type: opp.work_type,
      commitment_level: opp.commitment_level,
      deadline: opp.deadline?.split("T")[0] || opp.deadline || "",
      compensation: opp.compensation || "",
    });
    setEditingId(opp._id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.role_title || !form.required_skills || !form.deadline) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/opportunities/${editingId}`, {
        method: "PATCH",
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

      if (!res.ok) throw new Error();

      setOpportunities((prev) =>
        prev.map((o) =>
          o._id === editingId
            ? {
                ...o,
                ...form,
                compensation: form.compensation
                  ? Number(form.compensation)
                  : null,
                required_skills: form.required_skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }
            : o,
        ),
      );
      handleCancelEdit();
      showToast("Opportunity updated successfully.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this opportunity? This can't be undone.")) return;
    try {
      await fetch(`${API_URL}/api/opportunities/${id}`, {
        method: "DELETE",
      });
      setOpportunities((prev) => prev.filter((o) => o._id !== id));
      showToast("Opportunity deleted.");
    } catch {
      setError("Failed to delete opportunity.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-xl transition-all duration-300 ${
          toast
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-4 w-4 text-emerald-600" />
        </div>
        <p className="text-sm font-semibold text-gray-900">{toast}</p>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-base-content">
            Manage Opportunities
          </h2>
          <p className="mt-1 text-sm text-base-content/50">
            View, update and delete your posted roles
          </p>
        </div>
        <Link
          href="/dashboard/founder/opportunities/new"
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <CirclePlus className="h-5 w-5" />
          Add Opportunity
        </Link>
      </div>

      {/* Edit Form */}
      {editingId && (
        <div className="rounded-3xl border border-primary/30 bg-base-100 p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-base-content">
              Update Opportunity
            </h3>
            <button
              onClick={handleCancelEdit}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-base-content/50 hover:bg-base-200"
            >
              <Xmark className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            {/* Role Title */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-base-content">
                  Role Title
                </label>
                <input
                  type="text"
                  value={form.role_title}
                  onChange={(e) =>
                    setForm({ ...form, role_title: e.target.value })
                  }
                  placeholder="e.g. Full-Stack Developer"
                  className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none transition focus:border-primary"
                  required
                />
              </div>

              {/* Required Skills */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-base-content">
                  Required Skills
                </label>
                <input
                  type="text"
                  value={form.required_skills}
                  onChange={(e) =>
                    setForm({ ...form, required_skills: e.target.value })
                  }
                  placeholder="e.g. React, Node.js"
                  className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none transition focus:border-primary"
                  required
                />
              </div>
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
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center justify-center rounded-2xl border border-base-300 px-6 py-3.5 font-semibold text-base-content/70 transition hover:bg-base-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Opportunities list */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-3xl bg-base-200"
            />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 px-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Funnel className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 font-semibold text-base-content">
            No opportunities yet
          </p>
          <p className="mt-1 text-sm text-base-content/50">
            Post your first role to start finding collaborators.
          </p>
          <Link
            href="/dashboard/founder/opportunities/new"
            className="mt-6 flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <CirclePlus className="h-4 w-4" />
            Add Opportunity
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp._id}
              className={`rounded-3xl border bg-base-100 p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6 ${
                editingId === opp._id ? "border-primary/40" : "border-base-200"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left — main info */}
                <div className="flex flex-col gap-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-base-content text-base">
                      {opp.role_title}
                    </h4>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        STATUS_STYLES[opp.status] || STATUS_STYLES.open
                      }`}
                    >
                      {opp.status || "open"}
                    </span>
                  </div>

                  {/* Startup name */}
                  <p className="text-xs text-base-content/50 font-medium">
                    {getStartupName(opp.startup_id)}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(opp.required_skills)
                      ? opp.required_skills
                      : opp.required_skills?.split(",") || []
                    ).map((skill, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {skill.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-4 text-xs text-base-content/50">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      {opp.work_type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {opp.commitment_level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Deadline:{" "}
                      {opp.deadline
                        ? new Date(opp.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                    {opp.compensation && (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CircleDollar className="h-3.5 w-3.5" />$
                        {opp.compensation.toLocaleString()} / mo
                      </span>
                    )}
                  </div>
                </div>

                {/* Right — actions */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleEdit(opp)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-base-content/50 transition hover:bg-base-200 hover:text-primary"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(opp._id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-base-content/50 transition hover:bg-red-500/10 hover:text-red-500"
                    title="Delete"
                  >
                    <TrashBin className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
