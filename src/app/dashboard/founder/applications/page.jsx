"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Magnifier,
  Check,
  Xmark,
  Clock,
  Calendar,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS_TABS = ["All", "Pending", "Accepted", "Rejected"];

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700 border border-amber-300",
  Accepted: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  Rejected: "bg-red-100 text-red-700 border border-red-300",
};

export default function FounderApplicationsPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/founder/applications?founder_email=${encodeURIComponent(user.email)}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setApplications(data || []);
      } catch (err) {
        console.error("Failed to load applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [user?.email]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_URL}/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setApplications((prev) =>
        prev.map((a) =>
          a._id?.toString() === id ? { ...a, status } : a
        )
      );
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = applications.filter((app) => {
    const matchesTab =
      activeTab === "All" || app.status?.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      app.applicant_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.opportunity_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    All: applications.length,
    Pending: applications.filter((a) => a.status === "Pending").length,
    Accepted: applications.filter((a) => a.status === "Accepted").length,
    Rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-base-content">Applications</h2>
        <p className="mt-1 text-sm text-base-content/50">
          Review and manage applications received on your opportunities
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-base-200 bg-base-100 p-4 shadow-xs">
        {/* Status tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-base-content/60 hover:bg-base-200"
              }`}
            >
              {tab}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === tab
                    ? "bg-white/20 text-white"
                    : "bg-base-200 text-base-content/50"
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Magnifier className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search applicant or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-base-300 bg-base-100 py-2.5 pl-11 pr-4 text-xs outline-none transition focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-base-200 bg-base-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col divide-y divide-base-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-10 w-10 rounded-full bg-base-200 animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-40 rounded-lg bg-base-200 animate-pulse" />
                  <div className="h-3 w-56 rounded-lg bg-base-200 animate-pulse" />
                </div>
                <div className="h-6 w-20 rounded-full bg-base-200 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-base-content">No applications found</p>
              <p className="mt-1 text-sm text-base-content/50">
                {applications.length === 0
                  ? "No one has applied to your opportunities yet."
                  : "Try adjusting your search or status filter."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[2fr_2fr_1.4fr_1fr_1.5fr] gap-4 px-6 py-3 border-b border-base-200 bg-base-200/40">
              {["APPLICANT", "POSITION", "APPLIED ON", "STATUS", "ACTIONS"].map((h) => (
                <span
                  key={h}
                  className="text-[10px] font-bold uppercase tracking-widest text-base-content/40"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div className="flex flex-col divide-y divide-base-200">
              {filtered.map((app) => {
                const id = app._id?.toString();
                const initials =
                  app.applicant_email?.charAt(0).toUpperCase() || "?";
                const date = app.applied_at || app.createdAt
                  ? new Date(app.applied_at || app.createdAt).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "2-digit", day: "2-digit" }
                    )
                  : "—";
                const isPending = app.status === "Pending";
                const isUpdating = updatingId === id;

                return (
                  <div
                    key={id}
                    className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1.4fr_1fr_1.5fr] gap-3 sm:gap-4 items-center px-6 py-4 transition hover:bg-base-200/30"
                  >
                    {/* Applicant */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-base-content">
                          {app.applicant_email}
                        </p>
                      </div>
                    </div>

                    {/* Position */}
                    <p className="text-sm text-base-content/70 font-medium truncate">
                      {app.opportunity_name}
                    </p>

                    {/* Applied On */}
                    <span className="flex items-center gap-1.5 text-xs text-base-content/50">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {date}
                    </span>

                    {/* Status */}
                    <span
                      className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_STYLES[app.status] || STATUS_STYLES.Pending
                      }`}
                    >
                      {app.status || "Pending"}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(id, "Accepted")}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 rounded-xl border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(id, "Rejected")}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 rounded-xl border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Xmark className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(id, "Pending")}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 rounded-xl border border-base-300 px-3 py-1.5 text-xs font-semibold text-base-content/50 transition hover:bg-base-200 disabled:opacity-50"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
