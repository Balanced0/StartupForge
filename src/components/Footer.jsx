import Link from "next/link";
import {
  Rocket,
  EnvelopeOpen,
  Handset,
  MapPin,
  LogoLinkedin,
  LogoGithub,
  Globe,
} from "@gravity-ui/icons";

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Startups", href: "/startups" },
  { label: "Browse Opportunities", href: "/opportunities" },
  { label: "Login", href: "/login" },
];

const socialLinks = [
  { icon: <XIcon />, href: "#" },
  {
    icon: <LogoLinkedin className="h-4 w-4" />,
    href: "https://www.linkedin.com/in/md-alvi-chowdhury/",
  },
  {
    icon: <LogoGithub className="h-4 w-4" />,
    href: "https://github.com/Balanced0",
  },
  { icon: <Globe className="h-4 w-4" />, href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0d0d12] border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-6 lg:max-w-[280px]">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                <Rocket className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                StartupForge
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-white/50">
              Where ambitious founders meet exceptional collaborators. Build
              your dream team and forge the next big thing.
            </p>

            <div className="flex items-center gap-2">
              {socialLinks.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/50 transition hover:border-primary hover:text-primary"
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links + Contact */}
          <div className="flex flex-col gap-12 sm:flex-row sm:gap-20">
            {/* Quick Links */}
            <div className="flex flex-col gap-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Quick Links
              </h3>
              <ul className="flex flex-col gap-4">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-white/70 transition hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Contact
              </h3>
              <ul className="flex flex-col gap-4">
                <li>
                  <a
                    href="mailto:hello@startupforge.io"
                    className="flex items-center gap-3 text-sm font-medium text-white/70 transition hover:text-primary"
                  >
                    <EnvelopeOpen className="h-4 w-4 text-primary flex-shrink-0" />
                    hello@startupforge.io
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+14155550192"
                    className="flex items-center gap-3 text-sm font-medium text-white/70 transition hover:text-primary"
                  >
                    <Handset className="h-4 w-4 text-primary flex-shrink-0" />
                    +1 (415) 555-0192
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-white/70">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  San Francisco, CA
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-white/40">
            © 2024 StartupForge, Inc. All rights reserved.
          </span>
          <div className="flex items-center gap-5 text-xs text-white/40">
            <Link href="/privacy" className="transition hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/cookies" className="transition hover:text-primary">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
