"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

const ROLE_PREFIX = {
  founder: "/dashboard/founder",
  collaborator: "/dashboard/collaborator",
  admin: "/dashboard/admin",
};

export default function DashboardGuard({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();

  const user = session?.user;
  const allowedPrefix = user?.role ? ROLE_PREFIX[user.role] : null;
  const isAuthorized = allowedPrefix && pathname.startsWith(allowedPrefix);

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/signin");
    }
  }, [isPending, user, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a12] px-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <svg
            className="h-8 w-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.96L13.75 4a2 2 0 00-3.5 0L3.25 16.04A2 2 0 005.07 19z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Unauthorized</h1>
        <p className="text-sm text-white/50 max-w-sm">
          You don't have permission to access this page. This area is reserved
          for{" "}
          <span className="font-semibold capitalize text-white/70">
            {Object.entries(ROLE_PREFIX).find(([, prefix]) =>
              pathname.startsWith(prefix),
            )?.[0] ?? "another role"}
          </span>{" "}
          accounts.
        </p>
        <a
          href={allowedPrefix}
          className="mt-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          Go to my Dashboard
        </a>
      </div>
    );
  }

  return children;
}
