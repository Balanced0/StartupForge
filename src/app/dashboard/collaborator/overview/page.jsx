"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  Check,
  PersonGear,
  Magnifier,
  ArrowUpFromSquare,
  Tag,
  CirclePlus,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CollaboratorOverview() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [applications, setApplications] = useState([]);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;
      try {
        const appRes = await fetch(`${API_URL}/api/applications?applicant_email=${user.email}`);
        const appData = await appRes.json();
        setApplications(appData || []);

        const userRes = await fetch(`${API_URL}/api/users/${user.email}`);
        const userText = await userRes.text();
        const userData = userText ? JSON.parse(userText) : null;
        setDbUser(userData && Object.keys(userData).length > 0 ? userData : null);
      } catch (err) {
        console.error("Error fetching overview data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.email]);

  const totalApps = applications.length;
  const pendingApps = applications.filter((a) => a.status?.toLowerCase() === "pending").length;
  const approvedApps = applications.filter((a) => a.status?.toLowerCase() === "approved" || a.status?.toLowerCase() === "accepted").length;

  const hasSkills = dbUser?.skills && dbUser.skills.length > 0;
  const hasBio = dbUser?.bio && dbUser.bio.trim().length > 0;
  let profileCompletion = 25;
  if (user?.image || dbUser?.image) profileCompletion += 25;
  if (hasSkills) profileCompletion += 25;
  if (hasBio) profileCompletion += 25;

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="h-16 w-1/3 animate-pulse rounded-2xl bg-base-200" />
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-base-200" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-3xl bg-base-200 lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-3xl bg-base-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-base-content">
          Welcome back, {user?.name?.split(" ")[0] || "Collaborator"}!
        </h2>
        <p className="mt-1 text-sm text-base-content/50">
          Here's an overview of your applications and opportunities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Total Applications */}
        <div className="flex items-center gap-4 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-base-content/50">Total Applications</p>
            <h3 className="text-2xl font-bold text-base-content mt-0.5">{totalApps}</h3>
          </div>
        </div>

        {/* Pending Review */}
        <div className="flex items-center gap-4 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-base-content/50">Pending Review</p>
            <h3 className="text-2xl font-bold text-base-content mt-0.5">{pendingApps}</h3>
          </div>
        </div>

        {/* Approved applications */}
        <div className="flex items-center gap-4 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-base-content/50">Approved Roles</p>
            <h3 className="text-2xl font-bold text-base-content mt-0.5">{approvedApps}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Applications */}
        <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-base-content">Recent Applications</h3>
            <Link
              href="/dashboard/collaborator/applications"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                <Magnifier className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-base-content">No applications yet</p>
              <p className="text-xs text-base-content/50 mt-0.5 mb-4">
                Explore open roles created by startup founders
              </p>
              <Link
                href="/dashboard/collaborator/opportunities"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Magnifier className="h-4.5 w-4.5" />
                Browse Opportunities
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.slice(0, 3).map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between rounded-2xl border border-base-200 p-4 transition-all hover:bg-base-200/50"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-base-content text-sm truncate">
                      {app.opportunity_name}
                    </h4>
                    <p className="text-xs text-base-content/50 mt-0.5 truncate">
                      {app.startup_name}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      app.status?.toLowerCase() === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : app.status?.toLowerCase() === "approved" || app.status?.toLowerCase() === "accepted"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {app.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Card & Quick Actions */}
        <div className="flex flex-col gap-5">
          {/* Profile Completion */}
          <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-base-content mb-4">Profile Status</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                {user?.image || dbUser?.image ? (
                  <img
                    src={dbUser?.image || user.image}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-lg text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-base-content text-sm">{user?.name}</h4>
                <p className="text-xs text-base-content/50">{user?.email}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold text-base-content/60 mb-1">
                <span>Profile Completion</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-base-200 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs text-base-content/60">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${user?.image || dbUser?.image ? "bg-emerald-500" : "bg-base-300"}`} />
                <span>Profile Picture</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${hasSkills ? "bg-emerald-500" : "bg-base-300"}`} />
                <span>Skills Listed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${hasBio ? "bg-emerald-500" : "bg-base-300"}`} />
                <span>Bio Added</span>
              </div>
            </div>

            <Link
              href="/dashboard/collaborator/profile"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-base-300 py-3 text-sm font-semibold text-base-content/70 transition hover:bg-base-200"
            >
              <PersonGear className="h-4.5 w-4.5" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
