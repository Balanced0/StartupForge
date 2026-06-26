"use client";

import { useState, useEffect } from "react";
import {
  OfficeBadge,
  Briefcase,
  Persons,
  Check,
  Calendar,
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
  Legend,
  BarChart,
  Bar,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DONUT_COLORS = ["#6366f1", "#a78bfa", "#34d399", "#fbbf24", "#60a5fa"];

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

const BAR_COLORS = {
  Pending: "#fbbf24",
  Accepted: "#34d399",
  Rejected: "#f87171",
};

// ---------- Sub-components ----------

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
          {label}
        </span>
        {loading ? (
          <div className="h-9 w-16 animate-pulse rounded-xl bg-base-200" />
        ) : (
          <span className="text-3xl font-extrabold tracking-tight text-base-content">
            {value}
          </span>
        )}
      </div>
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${color}`}
      >
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
}

function ChartSkeleton({ h = "h-64" }) {
  return (
    <div
      className={`${h} w-full animate-pulse rounded-2xl bg-base-200`}
    />
  );
}

// Custom tooltip for area/bar charts
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

// Custom legend for donut
function DonutLegend({ data }) {
  return (
    <div className="flex flex-col gap-2 justify-center">
      {data.map((entry, i) => (
        <div key={entry.name} className="flex items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <span className="text-base-content/70 font-medium">{entry.name}</span>
          </div>
          <span className="font-bold text-base-content">
            {Math.round((entry.value / data.reduce((a, b) => a + b.value, 0)) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------- Main Page ----------

export default function FounderOverviewPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.email) return;
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/founder/overview?founder_email=${encodeURIComponent(user.email)}`
        );
        if (!res.ok) throw new Error("Failed to fetch overview");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [user?.email]);

  const stats = data?.stats || {};
  const appsByMonth = data?.appsByMonth || [];
  const opportunitiesByWorkType = data?.opportunitiesByWorkType || [];
  const applicationsByStatus = data?.applicationsByStatus || [];
  const recentApplications = data?.recentApplications || [];

  const statCards = [
    {
      label: "My Startups",
      value: stats.totalStartups ?? 0,
      icon: OfficeBadge,
      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      label: "Opportunities",
      value: stats.totalOpportunities ?? 0,
      icon: Briefcase,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Total Applications",
      value: stats.totalApplications ?? 0,
      icon: Persons,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      label: "Accepted",
      value: stats.acceptedApplications ?? 0,
      icon: Check,
      color: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    },
  ];

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center gap-3">
        <p className="text-base font-semibold text-red-400">{error}</p>
        <p className="text-sm text-base-content/50">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-base-content">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} !
        </h2>
        <p className="mt-1 text-sm text-base-content/50">
          Here&apos;s a snapshot of your startup activity
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} loading={loading || sessionPending} />
        ))}
      </div>

      {/* Charts Row 1 — Area + Donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Applications Over Time */}
        <div className="lg:col-span-3 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xs">
          <h3 className="mb-1 text-base font-bold text-base-content">
            Applications Over Time
          </h3>
          <p className="mb-5 text-xs text-base-content/40">
            Received applications in the last 6 months
          </p>
          {loading ? (
            <ChartSkeleton h="h-56" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={appsByMonth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
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
                  dataKey="applications"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#appGrad)"
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#6366f1" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Opportunities by Work Type */}
        <div className="lg:col-span-2 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xs">
          <h3 className="mb-1 text-base font-bold text-base-content">
            Opportunities by Work Type
          </h3>
          <p className="mb-4 text-xs text-base-content/40">
            Distribution across your postings
          </p>
          {loading ? (
            <ChartSkeleton h="h-56" />
          ) : opportunitiesByWorkType.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-base-content/40">
              No opportunities posted yet
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={opportunitiesByWorkType}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {opportunitiesByWorkType.map((_, i) => (
                        <Cell
                          key={i}
                          fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <DonutLegend data={opportunitiesByWorkType} />
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 — Bar + Recent Applications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Application Status Breakdown */}
        <div className="lg:col-span-2 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xs">
          <h3 className="mb-1 text-base font-bold text-base-content">
            Application Status
          </h3>
          <p className="mb-5 text-xs text-base-content/40">
            Pending, accepted &amp; rejected counts
          </p>
          {loading ? (
            <ChartSkeleton h="h-48" />
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart
                data={applicationsByStatus}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                barSize={36}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
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
                  {applicationsByStatus.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={BAR_COLORS[entry.status] || "#6366f1"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Applications */}
        <div className="lg:col-span-3 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xs">
          <h3 className="mb-1 text-base font-bold text-base-content">
            Recent Applications
          </h3>
          <p className="mb-5 text-xs text-base-content/40">
            Latest collaborators who applied to your opportunities
          </p>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-base-200" />
              ))}
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-xs text-base-content/40">
              No applications received yet
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-base-200">
              {recentApplications.map((app) => {
                const initials = app.applicant_email?.charAt(0).toUpperCase() || "?";
                const date = app.applied_at
                  ? new Date(app.applied_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : null;
                return (
                  <div
                    key={app._id}
                    className="flex items-center justify-between gap-4 py-3.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-bold">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-base-content">
                          {app.applicant_email}
                        </p>
                        <p className="truncate text-xs text-base-content/50">
                          {app.opportunity_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {date && (
                        <span className="hidden sm:flex items-center gap-1 text-xs text-base-content/40">
                          <Calendar className="h-3 w-3" />
                          {date}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          STATUS_STYLES[app.status] || STATUS_STYLES.Pending
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}