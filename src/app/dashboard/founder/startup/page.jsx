"use client";

import { useState, useEffect } from "react";
import {
  OfficeBadge,
  ArrowUpFromSquare,
  Pencil,
  TrashBin,
  CirclePlus,
  Xmark,
  Tag,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FUNDING_STAGES = [
  "Idea",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B+",
  "Bootstrapped",
];

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  closed: "bg-red-100 text-red-700",
};

const emptyForm = {
  startup_name: "",
  logo: "",
  industry: "",
  description: "",
  funding_stage: "Idea",
  founder_email: "",
};

export default function MyStartupPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Prefill founder email once session loads
  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({ ...prev, founder_email: user.email }));
    }
  }, [user]);

  // Fetch this founder's startups
  const fetchStartups = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/startups?founder_email=${user?.email}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setStartups(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load startups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchStartups();
  }, [user?.email]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      if (data.success) {
        setForm((prev) => ({ ...prev, logo: data.data.url }));
      } else {
        setError("Logo upload failed, try again");
      }
    } catch {
      setError("Logo upload failed, try again");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({ ...emptyForm, founder_email: user?.email || "" });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (startup) => {
    setForm({
      startup_name: startup.startup_name,
      logo: startup.logo,
      industry: startup.industry,
      description: startup.description,
      funding_stage: startup.funding_stage,
      founder_email: startup.founder_email,
    });
    setEditingId(startup._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this startup? This can't be undone.")) return;

    try {
      await fetch(`${API_URL}/api/startups/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setStartups((prev) => prev.filter((s) => s._id !== id));
    } catch {
      setError("Failed to delete startup");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.startup_name ||
      !form.industry ||
      !form.description ||
      !form.logo
    ) {
      setError("Please fill in all fields, including the logo.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        await fetch(`${API_URL}/api/startups/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        setStartups((prev) =>
          prev.map((s) =>
            s._id === editingId ? { ...s, ...form, updatedAt: new Date() } : s,
          ),
        );
      } else {
        const res = await fetch(`${API_URL}/api/startups`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        const result = await res.json();

        const newStartup = {
          ...form,
          _id: result.insertedId,
          status: "pending",
          createdAt: new Date(),
        };
        setStartups((prev) => [newStartup, ...prev]);
      }
      resetForm();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-base-content">My Startup</h2>
          <p className="mt-1 text-sm text-base-content/50">
            Manage the startups you've created
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <CirclePlus className="h-5 w-5" />
            Create Startup
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-base-content">
              {editingId ? "Update Startup" : "Create Startup"}
            </h3>
            <button
              onClick={resetForm}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base-content/50 hover:bg-base-200"
            >
              <Xmark className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Startup Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-base-content">
                  Startup Name
                </label>
                <input
                  type="text"
                  value={form.startup_name}
                  onChange={(e) =>
                    setForm({ ...form, startup_name: e.target.value })
                  }
                  placeholder="e.g. PulseAI"
                  className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none transition focus:border-primary"
                  required
                />
              </div>

              {/* Industry */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-base-content">
                  Industry
                </label>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(e) =>
                    setForm({ ...form, industry: e.target.value })
                  }
                  placeholder="e.g. FinTech, HealthTech"
                  className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none transition focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-base-content">
                Logo
              </label>
              <label className="flex cursor-pointer flex-wrap items-center gap-3">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-primary/10">
                  {uploading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : form.logo ? (
                    <img
                      src={form.logo}
                      alt="Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ArrowUpFromSquare className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-semibold text-primary">
                    {form.logo ? "Change logo" : "Upload logo"}
                  </span>
                  <p className="text-xs text-base-content/40">
                    JPG or PNG, up to 2MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-base-content">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What does your startup do?"
                rows={4}
                className="w-full resize-none rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none transition focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Funding Stage */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-base-content">
                  Funding Stage
                </label>
                <select
                  value={form.funding_stage}
                  onChange={(e) =>
                    setForm({ ...form, funding_stage: e.target.value })
                  }
                  className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none transition focus:border-primary"
                >
                  {FUNDING_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Founder Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-base-content">
                  Founder Email
                </label>
                <input
                  type="email"
                  value={form.founder_email}
                  onChange={(e) =>
                    setForm({ ...form, founder_email: e.target.value })
                  }
                  className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none transition focus:border-primary"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex flex-col gap-3 mt-2 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={submitting || uploading}
                className="rounded-2xl bg-primary px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting
                  ? "Saving..."
                  : editingId
                    ? "Update Startup"
                    : "Create Startup"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-base-300 px-6 py-3.5 font-semibold text-base-content/70 transition hover:bg-base-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Startup List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-3xl bg-base-200"
            />
          ))}
        </div>
      ) : startups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 px-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <OfficeBadge className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 font-semibold text-base-content">
            No startups yet
          </p>
          <p className="mt-1 text-sm text-base-content/50">
            Create your first startup to start finding collaborators.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {startups.map((startup) => (
            <div
              key={startup._id}
              className="flex flex-col gap-4 rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={startup.logo}
                    alt={startup.startup_name}
                    className="h-12 w-12 flex-shrink-0 rounded-2xl object-cover"
                  />
                  <div className="min-w-0">
                    <h4 className="truncate font-bold text-base-content">
                      {startup.startup_name}
                    </h4>
                    <span className="flex items-center gap-1 text-xs text-base-content/50">
                      <Tag className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{startup.industry}</span>
                    </span>
                  </div>
                </div>

                <span
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    STATUS_STYLES[startup.status] || STATUS_STYLES.pending
                  }`}
                >
                  {startup.status || "pending"}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-base-content/60 line-clamp-3">
                {startup.description}
              </p>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {startup.funding_stage}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(startup)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-base-content/50 transition hover:bg-base-200 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(startup._id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-base-content/50 transition hover:bg-red-500/10 hover:text-red-500"
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
