import Link from "next/link";
import { Tag, Calendar, Globe, Clock, CircleDollar } from "@gravity-ui/icons";

export default function OpportunityCard({ opportunity, user }) {
  const {
    _id,
    startup_id,
    role_title,
    startup_name,
    startup_logo,
    required_skills = [],
    work_type,
    commitment_level,
    deadline,
    compensation,
  } = opportunity;

  const deadlineDate = deadline ? new Date(deadline) : null;
  const isExpiringSoon =
    deadlineDate && (deadlineDate - new Date()) / (1000 * 60 * 60 * 24) <= 7;

  const isCollaborator = user?.role === "collaborator";

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {startup_logo ? (
            <img
              src={startup_logo}
              alt={startup_name}
              className="h-11 w-11 flex-shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15 font-bold text-primary">
              {startup_name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate font-bold text-base-content">
              {role_title}
            </h3>
            <p className="truncate text-xs text-base-content/50">
              {startup_name}
            </p>
          </div>
        </div>

        {isExpiringSoon && (
          <span className="flex-shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
            Closing soon
          </span>
        )}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {required_skills.slice(0, 4).map((skill, i) => (
          <span
            key={i}
            className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
          >
            <Tag className="h-2.5 w-2.5" />
            {skill}
          </span>
        ))}
        {required_skills.length > 4 && (
          <span className="rounded-full bg-base-200 px-2.5 py-0.5 text-xs font-semibold text-base-content/50">
            +{required_skills.length - 4}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-base-content/50">
        <span className="flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" />
          {work_type}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {commitment_level}
        </span>
        {compensation && (
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <CircleDollar className="h-3.5 w-3.5" />$
            {compensation.toLocaleString()} / mo
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-base-200 pt-4">
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${
            isExpiringSoon ? "text-red-500" : "text-base-content/50"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          {deadlineDate
            ? deadlineDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "No deadline"}
        </span>

        {/* Apply button — only enabled for collaborators */}
        <div className="relative group/btn">
          {isCollaborator ? (
            <Link
              href={`/startups/${startup_id}?apply=${_id}`}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Apply Now
            </Link>
          ) : (
            <>
              <button
                disabled
                className="cursor-not-allowed rounded-xl bg-base-200 px-4 py-2 text-xs font-semibold text-base-content/40"
              >
                Apply Now
              </button>
              <div className="pointer-events-none absolute -top-10 right-0 z-10 hidden w-max max-w-[200px] rounded-xl bg-base-content px-3 py-1.5 text-center text-xs text-base-100 shadow-lg group-hover/btn:block">
                {!user
                  ? "Sign in as a collaborator to apply"
                  : "Only collaborators can apply"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
