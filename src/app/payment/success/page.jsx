"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckShapeFill, Rocket } from "@gravity-ui/icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const verify = async () => {
      if (!session_id) {
        setStatus("error");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/payments/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id }),
        });
        const data = await res.json();
        setStatus(data.success ? "success" : "error");
      } catch {
        setStatus("error");
      }
    };
    verify();
  }, [session_id]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200/50">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-base-content/50">
            Confirming your payment...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-base-200/50 px-5 text-center">
        <p className="text-lg font-bold text-base-content">
          Something went wrong
        </p>
        <p className="mt-2 text-sm text-base-content/50">
          Your payment may have gone through. Please contact support.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-2xl bg-primary px-6 py-3 font-semibold text-white"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-200/50 px-5 text-center">
      <div className="w-full max-w-md rounded-3xl border border-base-200 bg-base-100 p-10 shadow-sm">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-emerald-100">
          <CheckShapeFill className="h-10 w-10 text-emerald-600" />
        </div>

        <h1 className="mt-6 text-2xl font-extrabold text-base-content">
          You're now Premium! 🎉
        </h1>
        <p className="mt-3 text-sm text-base-content/50 leading-relaxed">
          Your payment was successful. You now have unlimited opportunity
          postings on StartupForge.
        </p>

        <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/20 p-4">
          <p className="text-sm font-semibold text-primary">
            ✓ Unlimited opportunity posts unlocked
          </p>
        </div>

        <Link
          href="/dashboard/founder/opportunities/new"
          className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Rocket className="h-5 w-5" />
          Post an Opportunity
        </Link>

        <Link
          href="/dashboard/founder/overview"
          className="mt-3 block text-sm font-semibold text-base-content/50 transition hover:text-primary"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
