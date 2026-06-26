"use client";

import { useState, useEffect } from "react";
import { CircleDollar, Calendar, Magnifier } from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS_STYLES = {
  Succeeded: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Pending: "bg-amber-100 text-amber-700 border border-amber-200",
  Failed: "bg-red-100 text-red-700 border border-red-200",
};

export default function AdminTransactionsPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.email || user.role !== "admin") return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/admin/transactions`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const data = await res.json();
        setTransactions(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load transactions history.");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTransactions();
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

  const filtered = transactions.filter(
    (t) =>
      !searchQuery ||
      t.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = transactions
    .filter((t) => t.paymentStatus === "Succeeded")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-base-content">Transactions</h2>
          <p className="mt-1 text-sm text-base-content/50">
            Audit ledger for all platform billing events and payments
          </p>
        </div>
        {/* Revenue pill */}
        {!loading && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 self-start sm:self-auto">
            <CircleDollar className="h-4 w-4" />
            Total Revenue: ${totalRevenue.toFixed(2)}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Magnifier className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
        <input
          type="text"
          placeholder="Search by user email or transaction ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-base-300 bg-base-100 py-3 pl-11 pr-4 text-xs outline-none transition focus:border-primary"
        />
      </div>

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Content */}
      {loading || sessionPending ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-base-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 px-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CircleDollar className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-base-content">
            {transactions.length === 0
              ? "No transactions recorded yet"
              : "No transactions match your search"}
          </p>
          <p className="mt-1 text-sm text-base-content/50">
            {transactions.length === 0
              ? "Payments will appear here once users purchase a plan."
              : "Try adjusting your search query."}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-base-200 bg-base-100 shadow-xs overflow-hidden">
          {/* Desktop table header — hidden on mobile */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1.5fr_1fr] gap-4 border-b border-base-200 bg-base-200/40 px-6 py-3">
            {["USER", "AMOUNT", "DATE", "STATUS"].map((h) => (
              <span
                key={h}
                className="text-[10px] font-bold uppercase tracking-widest text-base-content/40"
              >
                {h}
              </span>
            ))}
          </div>

          <div className="flex flex-col divide-y divide-base-200">
            {filtered.map((t) => {
              const id = t._id?.toString();
              const date = t.date
                ? new Date(t.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";
              const statusStyle =
                STATUS_STYLES[t.paymentStatus] || STATUS_STYLES.Pending;

              return (
                <div
                  key={id}
                  className="flex flex-col gap-3 px-5 py-4 transition hover:bg-base-200/20 sm:grid sm:grid-cols-[2fr_1fr_1.5fr_1fr] sm:items-center sm:gap-4 sm:px-6"
                >
                  {/* User — always visible */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {t.user?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-base-content">
                        {t.user || "Unknown"}
                      </p>
                      {t.transaction_id && (
                        <p className="truncate text-[10px] text-base-content/40 font-mono mt-0.5">
                          #{t.transaction_id.slice(0, 24)}…
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mobile: amount + date + status inline row */}
                  <div className="flex items-center justify-between sm:contents">
                    <span className="text-sm font-extrabold text-base-content">
                      ${t.amount?.toFixed(2) ?? "0.00"}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-base-content/50 sm:col-start-3">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {date}
                    </div>
                    <span
                      className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyle}`}
                    >
                      {t.paymentStatus}
                    </span>
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
