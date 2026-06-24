"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Rocket,
  Bars,
  Xmark,
  Person,
  ArrowRightFromSquare,
  LayoutColumns3,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Startups", href: "/startups" },
    { label: "Browse Opportunities", href: "/opportunities" },
  ];

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const getDashboardLink = (role) => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "collaborator") return "/dashboard/collaborator";
    return "/dashboard/founder";
  };

  const dashboardHref = getDashboardLink(user?.role);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    setProfileOpen(false);
    setOpen(false);
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-base-200 bg-base-100/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-sm">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              StartupForge
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-base-content/70 transition-all duration-200 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-5">
            {!isPending && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-base-200"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="font-medium text-base-content/80">
                    {user.name?.split(" ")[0]}
                  </span>
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-base-200 bg-base-100 p-2 shadow-lg transition-all duration-150 ${
                    profileOpen
                      ? "opacity-100 scale-100"
                      : "pointer-events-none opacity-0 scale-95"
                  }`}
                >
                  <div className="px-3 py-2 border-b border-base-200 mb-1">
                    <p className="font-semibold text-sm text-base-content truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-base-content/50 truncate">
                      {user.email}
                    </p>
                    {user.role && (
                      <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                        {user.role}
                      </span>
                    )}
                  </div>

                  <Link
                    href={dashboardHref}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-base-content/80 transition hover:bg-base-200"
                  >
                    <LayoutColumns3 className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-base-content/80 transition hover:bg-base-200"
                  >
                    <Person className="h-4 w-4" />
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
                  >
                    <ArrowRightFromSquare className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="font-medium text-base-content/70 transition-colors hover:text-primary"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-content shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-base-200 lg:hidden"
          >
            {open ? (
              <Xmark className="h-5 w-5" />
            ) : (
              <Bars className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            open ? "max-h-[28rem] pb-6" : "max-h-0"
          }`}
        >
          <div className="rounded-3xl border border-base-200 bg-base-100 p-3 shadow-lg">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 font-medium text-base-content/80 transition hover:bg-base-200 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 h-px bg-base-200" />

              {!isPending && user ? (
                <>
                  {/* User info strip */}
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-base-content">
                        {user.name}
                      </p>
                      <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-base-content/80 transition hover:bg-base-200"
                  >
                    <LayoutColumns3 className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-base-content/80 transition hover:bg-base-200"
                  >
                    <Person className="h-4 w-4" />
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-500 transition hover:bg-red-50"
                  >
                    <ArrowRightFromSquare className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 font-medium text-base-content/80 transition hover:bg-base-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="mt-2 rounded-xl bg-primary px-4 py-3 text-center font-semibold text-primary-content transition hover:opacity-90"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
