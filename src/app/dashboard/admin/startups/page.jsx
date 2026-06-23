"use client";

import { useState, useEffect } from "react";
import { OfficeBadge, TrashBin, Check } from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS_FILTERS = ["All", "Pending", "Active"];

export default function AdminStartupsPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user;

  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [actionLoading, setActionLoading] = useState(null); // startup _id
  const [error, setError] = useState("");

  const fetchStartups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/startups`);
      if (!res.ok) throw new Error("Failed to fetch startups");
      const data = await res.json();
      setStartups(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load startups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email && user.role === "admin") {
      fetchStartups();
    }
  }, [user]);

  const handleApprove = async (startupId) => {
    setActionLoading(startupId);
    try {
      const res = await fetch(`${API_URL}/api/admin/startups/${startupId}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve startup");
      
      // Update state locally
      setStartups((prev) =>
        prev.map((s) =>
          s._id === startupId ? { ...s, status: "active" } : s
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error approving startup.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (startupId, startupName) => {
    if (!confirm(`Are you sure you want to permanently delete startup "${startupName}"? This cannot be undone.`)) {
      return;
    }

    setActionLoading(startupId);
    try {
      const res = await fetch(`${API_URL}/api/admin/startups/${startupId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete startup");
      
      // Update state locally
      setStartups((prev) => prev.filter((s) => s._id !== startupId));
    } catch (err) {
      console.error(err);
      alert("Error removing startup.");
    } finally {
      setActionLoading(null);
    }
  };

  // Auth Guard View
  if (!sessionPending && (!user || user.role !== "admin")) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
        <p className="mt-2 text-base-content/60">
          You do not have permission to access the administration dashboard.
        </p>
      </div>
    );
  }

  const filteredStartups = startups.filter((s) => {
    if (activeTab === "All") return true;
    return s.status?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-base-content">Manage Startups</h2>
          <p className="mt-1 text-sm text-base-content/50">
            Review registration submissions, approve active profiles, or remove entries
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 rounded-3xl border border-base-200 bg-base-100 p-1.5 self-start sm:self-auto shadow-xs">
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-base-content/60 hover:bg-base-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Startups Grid / Content */}
      {loading || sessionPending ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl bg-base-200" />
          ))}
        </div>
      ) : filteredStartups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 px-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <OfficeBadge className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-base-content">No startups found</p>
          <p className="mt-1 text-sm text-base-content/50">
            There are no startups under the status filter: {activeTab}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStartups.map((s) => (
            <div
              key={s._id}
              className="flex flex-col rounded-3xl border border-base-200 bg-base-100 p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
            >
              <div className="flex items-start gap-4">
                {s.logo ? (
                  <img
                    src={s.logo}
                    alt={s.startup_name}
                    className="h-14 w-14 rounded-2xl object-cover border border-base-200"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary text-lg">
                    {s.startup_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-base-content text-base truncate">
                    {s.startup_name}
                  </h4>
                  <span className="badge badge-sm font-semibold tracking-wide text-xs text-base-content/60 py-1.5 px-2.5 mt-1 border border-base-200">
                    {s.industry}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1 text-xs text-base-content/60">
                <p>
                  <span className="font-medium text-base-content/40">Founder: </span>
                  <span className="font-semibold text-base-content">{s.founder_email}</span>
                </p>
                <p>
                  <span className="font-medium text-base-content/40">Funding: </span>
                  <span className="font-semibold text-base-content">{s.funding_stage || "—"}</span>
                </p>
              </div>

              <p className="mt-4 text-xs text-base-content/75 line-clamp-3 leading-relaxed flex-1">
                {s.description || "No description provided."}
              </p>

              <div className="mt-6 border-t border-base-200 pt-4 flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    s.status?.toLowerCase() === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : s.status?.toLowerCase() === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {s.status || "Pending"}
                </span>

                <div className="flex items-center gap-2">
                  {s.status?.toLowerCase() === "pending" && (
                    <button
                      onClick={() => handleApprove(s._id)}
                      disabled={actionLoading === s._id}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition disabled:opacity-50"
                      title="Approve Startup"
                    >
                      <Check className="h-4.5 w-4.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(s._id, s.startup_name)}
                    disabled={actionLoading === s._id}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition disabled:opacity-50"
                    title="Remove Startup"
                  >
                    <TrashBin className="h-4.5 w-4.5" />
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
