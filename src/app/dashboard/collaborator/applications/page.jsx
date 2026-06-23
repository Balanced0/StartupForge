"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Globe,
  Clock,
  Check,
  Xmark,
  Magnifier,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected"];

export default function MyApplicationsPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/applications?applicant_email=${user.email}`);
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

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.opportunity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.startup_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      activeTab === "All" || app.status?.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-base-content">My Applications</h2>
        <p className="mt-1 text-sm text-base-content/50">
          Track the status of your applications to various startups
        </p>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-base-100 border border-base-200 p-4 rounded-3xl shadow-sm">
        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-base-content/60 hover:bg-base-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Magnifier className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-base-300 bg-base-100 py-2.5 pl-11 pr-4 text-xs outline-none transition focus:border-primary"
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-base-200" />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 px-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-base-content">No applications found</p>
          <p className="mt-1 text-sm text-base-content/50">
            {applications.length === 0
              ? "You haven't applied to any roles yet."
              : "Try adjusting your search query or status filter."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredApplications.map((app) => (
            <div
              key={app._id}
              className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm transition-all duration-300 hover:shadow-md sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Info block */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h4 className="font-bold text-base-content text-base">
                      {app.opportunity_name}
                    </h4>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        app.status?.toLowerCase() === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : app.status?.toLowerCase() === "approved" || app.status?.toLowerCase() === "accepted"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {app.status || "Pending"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-primary">{app.startup_name}</p>
                  
                  {/* Applied Date */}
                  <span className="flex items-center gap-1 mt-1 text-xs text-base-content/50">
                    <Calendar className="h-3.5 w-3.5" />
                    Applied Date: {app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }) : "—"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="rounded-xl border border-base-300 px-4 py-2.5 text-xs font-semibold text-base-content/75 transition hover:bg-base-200"
                  >
                    View Details
                  </button>
                  <a
                    href={app.portfolio_link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                  >
                    My Portfolio
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl text-base-content/50 hover:bg-base-200"
            >
              <Xmark className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-base-content mb-1">
              Application Details
            </h3>
            <p className="text-xs text-base-content/50 mb-5">
              To: <span className="font-semibold text-primary">{selectedApp.startup_name}</span> • For: <span className="font-semibold text-base-content">{selectedApp.opportunity_name}</span>
            </p>

            <div className="flex flex-col gap-4 text-sm text-base-content">
              {/* Status */}
              <div>
                <span className="text-xs text-base-content/50 block">Status</span>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1 capitalize ${
                    selectedApp.status?.toLowerCase() === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : selectedApp.status?.toLowerCase() === "approved" || selectedApp.status?.toLowerCase() === "accepted"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedApp.status || "Pending"}
                </span>
              </div>

              {/* Applied On */}
              <div>
                <span className="text-xs text-base-content/50 block">Applied On</span>
                <span className="font-medium">
                  {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : "—"}
                </span>
              </div>

              {/* Portfolio */}
              <div>
                <span className="text-xs text-base-content/50 block">Portfolio Link</span>
                <a
                  href={selectedApp.portfolio_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-medium hover:underline text-xs break-all"
                >
                  {selectedApp.portfolio_link}
                </a>
              </div>

              {/* Motivation Message */}
              <div>
                <span className="text-xs text-base-content/50 block mb-1">Motivation Message</span>
                <div className="rounded-2xl bg-base-200 p-4 text-xs text-base-content/80 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.motivation_message}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedApp(null)}
              className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
