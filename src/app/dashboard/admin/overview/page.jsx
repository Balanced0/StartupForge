"use client";

import { useState, useEffect } from "react";
import {
  Persons,
  OfficeBadge,
  Briefcase,
  CircleDollar,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Palette aligned with the site's indigo/primary colour family
const ROLE_COLORS = ["#6366f1", "#a78bfa", "#34d399", "#fbbf24"];
const STATUS_COLORS = { Active: "#34d399", Pending: "#fbbf24", Rejected: "#f87171" };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-base-200 bg-base-100 px-4 py-3 shadow-lg text-xs">
      <p className="font-bold text-base-content mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function DonutLegend({ data, colors }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col gap-2.5 justify-center min-w-[120px]">
      {data.map((entry, i) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-base-content/70 font-medium">{entry.name}</span>
          </div>
          <span className="font-bold text-base-content">
            {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton({ h = "h-52" }) {
  return <div className={`${h} w-full animate-pulse rounded-2xl bg-base-200`} />;
}

export default function AdminOverviewPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user;

  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.email || user.role !== "admin") return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        setStats(await res.json());
      } catch (err) {
        console.error(err);
        setError("Error loading system metrics.");
      } finally {
        setLoading(false);
      }
    };

    const fetchCharts = async () => {
      setChartsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/admin/overview-charts`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch chart data");
        setCharts(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setChartsLoading(false);
      }
    };

    fetchStats();
    fetchCharts();
  }, [user]);

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

  const usersByRole = charts?.usersByRole || [];
  const startupsByStatus = charts?.startupsByStatus || [];
  const signupsByMonth = charts?.signupsByMonth || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-base-content">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-base-content/50">
          Real-time system overview and high-level platform statistics
        </p>
      </div>

      {/* Stat Cards */}
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

      {/* Charts Row 1 — User Signups (wide) + Users by Role (donut) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* User Signups Over Time */}
        <div className="lg:col-span-3 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xs">
          <h3 className="text-base font-bold text-base-content mb-1">
            New User Signups
          </h3>
          <p className="text-xs text-base-content/40 mb-5">
            Registrations over the last 6 months
          </p>
          {chartsLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart
                data={signupsByMonth}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  strokeOpacity={0.06}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "currentColor", opacity: 0.45 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "currentColor", opacity: 0.45 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="signups"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#signupGrad)"
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#6366f1" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Users by Role donut */}
        <div className="lg:col-span-2 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xs">
          <h3 className="text-base font-bold text-base-content mb-1">
            Users by Role
          </h3>
          <p className="text-xs text-base-content/40 mb-4">
            Breakdown of platform member types
          </p>
          {chartsLoading ? (
            <ChartSkeleton />
          ) : usersByRole.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-base-content/40">
              No user data yet
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={usersByRole}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {usersByRole.map((_, i) => (
                        <Cell
                          key={i}
                          fill={ROLE_COLORS[i % ROLE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <DonutLegend data={usersByRole} colors={ROLE_COLORS} />
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 — Startups by Status (bar) + Platform Status note */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Startups by Status bar */}
        <div className="lg:col-span-2 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xs">
          <h3 className="text-base font-bold text-base-content mb-1">
            Startups by Status
          </h3>
          <p className="text-xs text-base-content/40 mb-5">
            Active vs. pending approval
          </p>
          {chartsLoading ? (
            <ChartSkeleton h="h-44" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={startupsByStatus}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                barSize={40}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  strokeOpacity={0.06}
                  vertical={false}
                />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 11, fill: "currentColor", opacity: 0.45 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "currentColor", opacity: 0.45 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {startupsByStatus.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        STATUS_COLORS[entry.status] ||
                        ROLE_COLORS[i % ROLE_COLORS.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform status summary */}
        <div className="lg:col-span-3 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xs sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-base-content mb-2">
              Platform Status
            </h3>
            <p className="text-sm text-base-content/60 leading-relaxed max-w-xl">
              Welcome to the StartupForge Admin Control Center. Use the sidebar
              navigation to moderate platform users, review and approve startup
              registrations, and track transactional data.
            </p>
          </div>

          {/* Quick stats summary */}
          {!chartsLoading && charts && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                {
                  label: "Founders",
                  value: usersByRole.find((r) => r.name === "Founder")?.value ?? 0,
                  color: "text-blue-500",
                },
                {
                  label: "Collaborators",
                  value:
                    usersByRole.find((r) => r.name === "Collaborator")?.value ?? 0,
                  color: "text-indigo-500",
                },
                {
                  label: "Active Startups",
                  value:
                    startupsByStatus.find((s) => s.status === "Active")?.count ?? 0,
                  color: "text-emerald-500",
                },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className={`text-2xl font-extrabold ${item.color}`}>
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-xs text-base-content/50">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
