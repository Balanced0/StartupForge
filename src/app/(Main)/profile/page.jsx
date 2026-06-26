"use client";

import { authClient } from "@/lib/auth-client";
import {
  Person,
  Envelope,
  ShieldCheck,
  Calendar,
} from "@gravity-ui/icons";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-base-200 bg-base-100 px-5 py-4 transition hover:shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-base-content">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const joinedAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Avatar + name hero */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20 shadow-lg"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 text-primary ring-4 ring-primary/20 shadow-lg">
            <span className="text-4xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-base-content">
            {user?.name}
          </h1>
          <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold capitalize text-primary">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Info cards */}
      <div className="rounded-3xl border border-base-200 bg-base-200/30 p-4 shadow-xs">
        <h2 className="mb-4 px-1 text-sm font-bold uppercase tracking-wider text-base-content/40">
          Account Details
        </h2>
        <div className="flex flex-col gap-3">
          <InfoRow icon={Person} label="Full Name" value={user?.name} />
          <InfoRow icon={Envelope} label="Email Address" value={user?.email} />
          <InfoRow
            icon={ShieldCheck}
            label="Role"
            value={
              user?.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : null
            }
          />
          {joinedAt && (
            <InfoRow icon={Calendar} label="Member Since" value={joinedAt} />
          )}
        </div>
      </div>
    </div>
  );
}
