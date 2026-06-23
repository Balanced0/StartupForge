"use client";

import { useState, useEffect } from "react";
import { Magnifier, Persons } from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminUsersPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users`);
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
    if (user?.email && user.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const handleBlockToggle = async (targetUser) => {
    const isBlocked = targetUser.isBlocked;
    const actionText = isBlocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${actionText} ${targetUser.name}?`)) {
      return;
    }

    setActionLoading(targetUser.email);
    try {
      const endpoint = `${API_URL}/api/admin/users/${targetUser.email}/${actionText}`;
      const res = await fetch(endpoint, { method: "POST" });
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

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-base-content">Manage Users</h2>
          <p className="mt-1 text-sm text-base-content/50">
            Search, inspect details, and restrict user access to the platform
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Magnifier className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search users by name, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-base-300 bg-base-100 py-3 pl-11 pr-4 text-xs outline-none transition focus:border-primary"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Users Table */}
      {loading || sessionPending ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-base-200" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 px-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Persons className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-base-content">No users found</p>
          <p className="mt-1 text-sm text-base-content/50">
            No accounts match your search query.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
          <table className="table w-full">
            {/* head */}
            <thead>
              <tr className="border-b border-base-200 text-left text-xs uppercase tracking-wider text-base-content/50">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.email}
                  className="border-b border-base-200 transition hover:bg-base-200/20"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.image ? (
                        <img
                          src={u.image}
                          alt={u.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                          {u.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-base-content text-sm">
                          {u.name}
                        </div>
                        <div className="text-xs text-base-content/50">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-sm uppercase font-semibold text-xs tracking-wider text-base-content/75 py-2 px-3 border border-base-200">
                      {u.role || "collaborator"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.isBlocked ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                        Blocked
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleBlockToggle(u)}
                      disabled={actionLoading === u.email || u.role === "admin"}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition disabled:opacity-50 ${
                        u.isBlocked
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:hover:bg-red-500/10 disabled:hover:text-red-500"
                      }`}
                    >
                      {actionLoading === u.email
                        ? "Processing..."
                        : u.isBlocked
                        ? "Unblock"
                        : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
