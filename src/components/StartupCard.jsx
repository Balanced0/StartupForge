import Link from "next/link";
import { Persons, Briefcase, Tag, Person } from "@gravity-ui/icons";

export default function StartupCard({ startup }) {
  const {
    _id,
    startup_name,
    logo,
    industry,
    funding_stage,
    founder_email,
    description,
    openings_count = 0,
    members_count = 0,
  } = startup;

  // Show just the username part of the email as founder name
  const founderDisplay = founder_email
    ? founder_email.split("@")[0]
    : null;

  return (
    <Link
      href={`/startups/${_id}`}
      className="group flex flex-col rounded-3xl border border-base-200 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 overflow-hidden cursor-pointer"
    >
      {/* Banner gradient with logo */}
      <div className="relative h-36 bg-gradient-to-br from-primary/20 via-indigo-100 to-purple-100 flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, rgba(99,102,241,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.2) 0%, transparent 50%)",
          }}
        />
        {logo ? (
          <img
            src={logo}
            alt={startup_name}
            className="h-20 w-20 rounded-2xl object-cover shadow-md ring-4 ring-white"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-extrabold text-white shadow-md ring-4 ring-white">
            {startup_name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Startup Name + tags */}
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-bold text-base-content group-hover:text-primary transition-colors">
            {startup_name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {industry && (
              <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Tag className="h-2.5 w-2.5" />
                {industry}
              </span>
            )}
            {funding_stage && (
              <span className="rounded-full border border-base-300 px-2.5 py-0.5 text-xs font-semibold text-base-content/60">
                {funding_stage}
              </span>
            )}
          </div>
        </div>

        {/* Founder + Team Size info row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/50">
          {founderDisplay && (
            <span className="flex items-center gap-1">
              <Person className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate max-w-[120px]">{founderDisplay}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
            {openings_count} role{openings_count !== 1 ? "s" : ""} needed
          </span>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-base-content/60 line-clamp-2 flex-1">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-base-200 pt-3">
          <span className="flex items-center gap-1.5 text-xs text-base-content/50">
            <Persons className="h-3.5 w-3.5" />
            {members_count} member{members_count !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Briefcase className="h-3.5 w-3.5" />
            {openings_count} opening{openings_count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
