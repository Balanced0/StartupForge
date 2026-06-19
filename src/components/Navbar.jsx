"use client";

import Link from "next/link";
import { useState } from "react";
import { Rocket, Bars, Xmark } from "@gravity-ui/icons";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Startups", href: "/startups" },
    { label: "Browse Opportunities", href: "/opportunities" },
  ];

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

          {/* Desktop Navigation */}
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
            <Link
              href="/login"
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
            open ? "max-h-96 pb-6" : "max-h-0"
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

              <Link
                href="/login"
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
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
