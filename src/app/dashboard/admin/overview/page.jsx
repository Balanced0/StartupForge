"use client";

import { useState, useEffect } from "react";
import {
  Persons,
  OfficeBadge,
  Briefcase,
  CircleDollar,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminOverviewPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.email || user.role !== "admin") return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/admin/stats`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Error loading system metrics.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

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

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Persons,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      label: "Total Startups",
      value: stats?.totalStartups ?? 0,
      icon: OfficeBadge,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Total Opportunities",
      value: stats?.totalOpportunities ?? 0,
      icon: Briefcase,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      label: "Total Revenue",
      value: `$${stats?.totalRevenue ?? 0}`,
      icon: CircleDollar,
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-base-content">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-base-content/50">
          Real-time system overview and high-level platform statistics
        </p>
      </div>

      {/* Stats Grid */}
      {loading || sessionPending ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-3xl border border-base-200 bg-base-100"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
                    {card.label}
                  </span>
                  <span className="text-3xl font-extrabold text-base-content tracking-tight">
                    {card.value}
                  </span>
                </div>
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${card.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* System Status / Summary Card */}
      <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xs sm:p-8">
        <h3 className="text-lg font-bold text-base-content mb-2">
          Platform Status
        </h3>
        <p className="text-sm text-base-content/60 leading-relaxed max-w-xl">
          Welcome to the StartupForge Admin Control Center. Use the sidebar
          navigation to moderate platform users, review and approve startup registrations,
          and track transactional data.
        </p>
      </div>
    </div>
  );
}
