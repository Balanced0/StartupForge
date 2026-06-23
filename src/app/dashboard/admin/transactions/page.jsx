"use client";

import { useState, useEffect } from "react";
import { CircleDollar, Calendar } from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminTransactionsPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.email || user.role !== "admin") return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/admin/transactions`);
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

    if (user) {
      fetchTransactions();
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

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-base-content">Transactions</h2>
        <p className="mt-1 text-sm text-base-content/50">
          Audit ledger for all platform billing events, payments, and invoices
        </p>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Transactions Ledger */}
      {loading || sessionPending ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-base-200" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 px-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CircleDollar className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-base-content">No transactions recorded</p>
          <p className="mt-1 text-sm text-base-content/50">
            Billing history is currently empty.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
          <table className="table w-full">
            {/* head */}
            <thead>
              <tr className="border-b border-base-200 text-left text-xs uppercase tracking-wider text-base-content/50">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t._id}
                  className="border-b border-base-200 transition hover:bg-base-200/20"
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-base-content/75 text-xs">
                      #{t._id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-base-content text-sm">
                      {t.user}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-base-content text-sm">
                      ${t.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-base-content/60">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(t.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        t.paymentStatus?.toLowerCase() === "succeeded"
                          ? "bg-emerald-100 text-emerald-700"
                          : t.paymentStatus?.toLowerCase() === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.paymentStatus}
                    </span>
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
