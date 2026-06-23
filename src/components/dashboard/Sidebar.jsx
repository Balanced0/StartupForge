"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Rocket,
  LayoutColumns,
  OfficeBadge,
  CirclePlus,
  Briefcase,
  FileText,
  Magnifier,
  PersonGear,
  Persons,
  CircleDollar,
  ArrowRightFromSquare,
  Xmark,
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

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const navLinks = NAV_BY_ROLE[user?.role] || [];
  const normalizedPath = pathname?.replace(/\/$/, "") || "";

  // Pick the most specific (longest) matching href so that
  // /opportunities/new doesn't also highlight /opportunities
  const activeHref = navLinks
    .map((l) => l.href.replace(/\/$/, ""))
    .filter(
      (href) =>
        normalizedPath === href || normalizedPath.startsWith(href + "/"),
    )
    .sort((a, b) => b.length - a.length)[0];

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col overflow-y-auto border-r border-white/10 bg-[#0a0a12] px-5 py-6 transition-transform duration-300 lg:static lg:h-auto lg:min-h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo + close button (mobile) */}
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              StartupForge
            </span>
          </Link>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 hover:bg-white/5 lg:hidden"
          >
            <Xmark className="h-5 w-5" />
          </button>
        </div>

        <div className="my-6 h-px bg-white/10" />

        {/* Nav links */}
        {isPending ? (
          <div className="flex flex-col gap-2 px-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-2xl bg-white/5"
              />
            ))}
          </div>
        ) : (
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const normalizedHref = link.href.replace(/\/$/, "");
              const active = normalizedHref === activeHref;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold transition ${
                    active
                      ? "bg-primary text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex-1" />

        {/* Profile + sign out */}
        {user && (
          <div className="border-t border-white/10 pt-5">
            <div className="flex items-center gap-3 px-2">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-bold text-white text-sm">
                  {user.name}
                </p>
                <p className="text-sm capitalize text-white/40">{user.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-white/50 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <ArrowRightFromSquare className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
