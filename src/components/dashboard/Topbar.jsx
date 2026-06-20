"use client";

import { usePathname } from "next/navigation";
import { Bars } from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const NAV_BY_ROLE = {
  // ...same as before
};

export default function Topbar({ onMenuClick }) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const navLinks = NAV_BY_ROLE[user?.role] || [];
  const normalizedPath = pathname?.replace(/\/$/, "") || "";

  const currentLink = navLinks.find((link) => {
    const normalizedHref = link.href.replace(/\/$/, "");
    return (
      normalizedPath === normalizedHref ||
      normalizedPath.startsWith(normalizedHref + "/")
    );
  });

  const pageTitle = currentLink?.label || "Dashboard";

  return (
    <header className="flex h-20 items-center justify-between border-b border-base-200 bg-base-100 px-5 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-base-content/60 hover:bg-base-200 lg:hidden"
        >
          <Bars className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-base-content">{pageTitle}</h1>
      </div>

      {/* User info — same as before */}
      {isPending ? (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-base-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-base-200" />
        </div>
      ) : user ? (
        <div className="flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <span className="font-semibold text-base-content">
            {user.name?.split(" ")[0]}
          </span>
        </div>
      ) : null}
    </header>
  );
}
