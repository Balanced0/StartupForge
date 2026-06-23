"use client";

import { usePathname } from "next/navigation";
import {
  Bars,
  LayoutColumns,
  OfficeBadge,
  CirclePlus,
  Briefcase,
  FileText,
  Magnifier,
  PersonGear,
  Persons,
  CircleDollar,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const NAV_BY_ROLE = {
  founder: [
    {
      label: "Overview",
      href: "/dashboard/founder/overview",
      icon: LayoutColumns,
    },
    {
      label: "My Startup",
      href: "/dashboard/founder/startup",
      icon: OfficeBadge,
    },
    {
      label: "Add Opportunity",
      href: "/dashboard/founder/opportunities/new",
      icon: CirclePlus,
    },
    {
      label: "Manage Opportunities",
      href: "/dashboard/founder/opportunities",
      icon: Briefcase,
    },
    {
      label: "Applications",
      href: "/dashboard/founder/applications",
      icon: FileText,
    },
  ],
  collaborator: [
    {
      label: "Overview",
      href: "/dashboard/collaborator/overview",
      icon: LayoutColumns,
    },
    {
      label: "Browse Opportunities",
      href: "/dashboard/collaborator/opportunities",
      icon: Magnifier,
    },
    {
      label: "My Applications",
      href: "/dashboard/collaborator/applications",
      icon: FileText,
    },
    {
      label: "My Profile",
      href: "/dashboard/collaborator/profile",
      icon: PersonGear,
    },
  ],
  admin: [
    {
      label: "Overview",
      href: "/dashboard/admin/overview",
      icon: LayoutColumns,
    },
    { label: "Manage Users", href: "/dashboard/admin/users", icon: Persons },
    {
      label: "Manage Startups",
      href: "/dashboard/admin/startups",
      icon: OfficeBadge,
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: CircleDollar,
    },
  ],
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
