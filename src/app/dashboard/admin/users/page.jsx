"use client";

import { useState, useEffect } from "react";
import { Magnifier, Persons } from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ROLE_STYLES = {
  admin: "bg-purple-100 text-purple-700 border border-purple-200",
  founder: "bg-blue-100 text-blue-700 border border-blue-200",
  collaborator: "bg-indigo-100 text-indigo-700 border border-indigo-200",
};

export default function AdminUsersPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email && user.role === "admin") fetchUsers();
  }, [user]);

  const handleBlockToggle = async (targetUser) => {
    const isBlocked = targetUser.isBlocked;
    const actionText = isBlocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${actionText} ${targetUser.name}?`))
      return;

    setActionLoading(targetUser.email);
    try {
      const endpoint = `${API_URL}/api/admin/users/${targetUser.email}/${actionText}`;
      const res = await fetch(endpoint, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error(`Failed to ${actionText} user`);
      setUsers((prev) =>
        prev.map((u) =>
          u.email === targetUser.email ? { ...u, isBlocked: !isBlocked } : u
        )
      );
    } catch (err) {
      console.error(err);
      alert(`Error trying to ${actionText} user.`);
    } finally {
      setActionLoading(null);
    }
  };

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

  const ROLE_TABS = ["All", "founder", "collaborator", "admin"];

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    const matchesRole =
      roleFilter === "All" || (u.role || "collaborator") === roleFilter;
    return matchesSearch && matchesRole;
  });

  const counts = {
    All: users.length,
    founder: users.filter((u) => u.role === "founder").length,
    collaborator: users.filter(
      (u) => !u.role || u.role === "collaborator"
    ).length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-base-content">Manage Users</h2>
        <p className="mt-1 text-sm text-base-content/50">
          Search, inspect details, and restrict user access to the platform
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-base-200 bg-base-100 p-4 shadow-xs">
        {/* Role tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setRoleFilter(tab)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold capitalize transition ${
                roleFilter === tab
                  ? "bg-primary text-white"
                  : "text-base-content/60 hover:bg-base-200"
              }`}
            >
              {tab}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  roleFilter === tab
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
        <div className="relative min-w-[260px]">
          <Magnifier className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-base-300 bg-base-100 py-2.5 pl-11 pr-4 text-xs outline-none transition focus:border-primary"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Users list */}
      {loading || sessionPending ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-base-200" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 px-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Persons className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-base-content">No users found</p>
          <p className="mt-1 text-sm text-base-content/50">
            Try adjusting your search or role filter.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-base-200 bg-base-100 shadow-xs overflow-hidden">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-[2.5fr_1fr_1fr_1fr] gap-4 border-b border-base-200 bg-base-200/40 px-6 py-3">
            {["USER", "ROLE", "STATUS", "ACTIONS"].map((h) => (
              <span
                key={h}
                className={`text-[10px] font-bold uppercase tracking-widest text-base-content/40 ${
                  h === "ACTIONS" ? "text-right" : ""
                }`}
              >
                {h}
              </span>
            ))}
          </div>

          <div className="flex flex-col divide-y divide-base-200">
            {filteredUsers.map((u) => {
              const role = u.role || "collaborator";
              const roleStyle =
                ROLE_STYLES[role] ||
                "bg-base-200 text-base-content/60 border border-base-300";
              const isCurrentAdmin = role === "admin";
              const isProcessing = actionLoading === u.email;

              return (
                <div
                  key={u.email}
                  className="flex flex-col gap-3 px-5 py-4 transition hover:bg-base-200/20 sm:grid sm:grid-cols-[2.5fr_1fr_1fr_1fr] sm:items-center sm:gap-4 sm:px-6"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {u.image ? (
                      <img
                        src={u.image}
                        alt={u.name}
                        className="h-10 w-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm">
                        {u.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-bold text-base-content text-sm">
                        {u.name}
                      </p>
                      <p className="truncate text-xs text-base-content/50">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Mobile: role + status + action inline */}
                  <div className="flex items-center justify-between gap-3 sm:contents">
                    <span
                      className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleStyle}`}
                    >
                      {role}
                    </span>

                    {u.isBlocked ? (
                      <span className="w-fit rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
                        Blocked
                      </span>
                    ) : (
                      <span className="w-fit rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}

                    <div className="sm:text-right">
                      <button
                        onClick={() => handleBlockToggle(u)}
                        disabled={isProcessing || isCurrentAdmin}
                        title={
                          isCurrentAdmin
                            ? "Cannot block an admin account"
                            : undefined
                        }
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed ${
                          u.isBlocked
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        }`}
                      >
                        {isProcessing
                          ? "Processing…"
                          : u.isBlocked
                          ? "Unblock"
                          : "Block"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
