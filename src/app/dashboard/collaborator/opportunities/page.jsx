"use client";

import { useState, useEffect } from "react";
import {
  Magnifier,
  Globe,
  Clock,
  Calendar,
  CircleDollar,
  Xmark,
  Check,
  Tag,
  Eye,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const WORK_TYPES = ["All", "Remote", "On-site", "Hybrid"];
const COMMITMENT_LEVELS = ["All", "Full-time", "Part-time", "Contract", "Internship"];

export default function BrowseOpportunitiesPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [opportunities, setOpportunities] = useState([]);
  const [startups, setStartups] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkType, setSelectedWorkType] = useState("All");
  const [selectedCommitment, setSelectedCommitment] = useState("All");

  const [selectedOpp, setSelectedOpp] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [motivationMessage, setMotivationMessage] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const oppRes = await fetch(`${API_URL}/api/opportunities`, {
        credentials: "include",
      });
      const oppData = await oppRes.json();
      setOpportunities(Array.isArray(oppData) ? oppData : []);

      const startupsRes = await fetch(`${API_URL}/api/startups`, {
        credentials: "include",
      });
      const startupsData = await startupsRes.json();
      setStartups(Array.isArray(startupsData) ? startupsData : []);

      if (user?.email) {
        const appsRes = await fetch(`${API_URL}/api/applications?applicant_email=${user.email}`, {
          credentials: "include",
        });
        const appsData = await appsRes.json();
        setMyApplications(Array.isArray(appsData) ? appsData : []);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load opportunities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.email]);

  const getStartupDetails = (startup_id) => {
    const s = startups.find(
      (s) => s._id === startup_id || s._id?.toString() === startup_id
    );
    return s || { startup_name: "Unknown Startup", logo: null, industry: "N/A" };
  };

  const isAlreadyApplied = (opportunity_id) => {
    return myApplications.some(
      (app) => app.opportunity_id === opportunity_id || app.opportunity_id?.toString() === opportunity_id
    );
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const startup = getStartupDetails(opp.startup_id);
    
    const matchesSearch =
      opp.role_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.startup_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(opp.required_skills)
        ? opp.required_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
        : opp.required_skills?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesWorkType =
      selectedWorkType === "All" || opp.work_type === selectedWorkType;

    const matchesCommitment =
      selectedCommitment === "All" || opp.commitment_level === selectedCommitment;

    const isOpen = opp.status ? opp.status === "open" : true;

    return matchesSearch && matchesWorkType && matchesCommitment && isOpen;
  });

  const handleApplyClick = (opp) => {
    setSelectedOpp(opp);
    setShowApplyModal(true);
    setPortfolioLink("");
    setMotivationMessage("");
    setError("");
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!portfolioLink || !motivationMessage) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      new URL(portfolioLink);
    } catch {
      setError("Please enter a valid portfolio URL (e.g. https://github.com/username).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          opportunity_id: selectedOpp._id,
          applicant_email: user.email,
          portfolio_link: portfolioLink,
          motivation_message: motivationMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit application.");
      }

      showToast("Application submitted successfully!");
      setShowApplyModal(false);
      
      const appsRes = await fetch(`${API_URL}/api/applications?applicant_email=${user.email}`, {
        credentials: "include",
      });
      const appsData = await appsRes.json();
      setMyApplications(Array.isArray(appsData) ? appsData : []);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Toast Alert */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-xl transition-all duration-300 ${
          toast
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-4 w-4 text-emerald-600" />
        </div>
        <p className="text-sm font-semibold text-gray-900">{toast}</p>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-base-content">Browse Opportunities</h2>
        <p className="mt-1 text-sm text-base-content/50">
          Find and apply to startup roles created by founders
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-base-100 border border-base-200 p-4 rounded-3xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Magnifier className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search by role, startup name, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-base-300 bg-base-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Work Type */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-base-content/50">Work Type:</span>
            <select
              value={selectedWorkType}
              onChange={(e) => setSelectedWorkType(e.target.value)}
              className="rounded-xl border border-base-300 bg-base-100 px-3 py-2.5 text-xs font-semibold outline-none transition focus:border-primary"
            >
              {WORK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Commitment */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-base-content/50">Commitment:</span>
            <select
              value={selectedCommitment}
              onChange={(e) => setSelectedCommitment(e.target.value)}
              className="rounded-xl border border-base-300 bg-base-100 px-3 py-2.5 text-xs font-semibold outline-none transition focus:border-primary"
            >
              {COMMITMENT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl bg-base-200" />
          ))}
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 px-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Magnifier className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-base-content">No opportunities found</p>
          <p className="mt-1 text-sm text-base-content/50">
            Try adjusting your search criteria or filter selections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opp) => {
            const startup = getStartupDetails(opp.startup_id);
            const applied = isAlreadyApplied(opp._id);

            return (
              <div
                key={opp._id}
                className="flex flex-col gap-4 rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6"
              >
                {/* Startup Header */}
                <div className="flex items-start gap-3">
                  {startup.logo ? (
                    <img
                      src={startup.logo}
                      alt={startup.startup_name}
                      className="h-11 w-11 flex-shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                      {startup.startup_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-base-content text-sm truncate">
                      {opp.role_title}
                    </h4>
                    <p className="text-xs text-base-content/50 truncate">
                      {startup.startup_name} • {startup.industry}
                    </p>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(Array.isArray(opp.required_skills)
                    ? opp.required_skills
                    : opp.required_skills?.split(",") || []
                  ).slice(0, 3).map((skill, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {skill.trim()}
                    </span>
                  ))}
                  {(Array.isArray(opp.required_skills)
                    ? opp.required_skills
                    : opp.required_skills?.split(",") || []
                  ).length > 3 && (
                    <span className="rounded-full bg-base-200 px-2 py-0.5 text-[10px] font-bold text-base-content/60">
                      +{(Array.isArray(opp.required_skills) ? opp.required_skills : opp.required_skills?.split(",") || []).length - 3}
                    </span>
                  )}
                </div>

                {/* Meta details */}
                <div className="mt-2 flex flex-col gap-2 border-t border-base-100 pt-3 text-xs text-base-content/50">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      {opp.work_type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {opp.commitment_level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </span>
                    {opp.compensation && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600">
                        <CircleDollar className="h-3.5 w-3.5" />
                        ${opp.compensation.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-3 flex gap-2">
                  <button
                    onClick={() => setSelectedOpp(opp)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-base-300 py-2.5 text-xs font-semibold text-base-content/70 transition hover:bg-base-200"
                  >
                    <Eye className="h-4 w-4" />
                    Details
                  </button>

                  {applied ? (
                    <button
                      disabled
                      className="flex-1 rounded-xl bg-emerald-100 py-2.5 text-xs font-semibold text-emerald-700"
                    >
                      Applied
                    </button>
                  ) : user?.role === "collaborator" ? (
                    <button
                      onClick={() => handleApplyClick(opp)}
                      className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      Apply Now
                    </button>
                  ) : (
                    <div className="relative flex-1 group/btn">
                      <button
                        disabled
                        className="w-full cursor-not-allowed rounded-xl bg-base-200 py-2.5 text-xs font-semibold text-base-content/40"
                      >
                        Apply Now
                      </button>
                      <div className="pointer-events-none absolute -top-10 right-0 z-10 hidden w-max max-w-[200px] rounded-xl bg-base-content px-3 py-1.5 text-center text-xs text-base-100 shadow-lg group-hover/btn:block">
                        Only collaborators can apply
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Opportunity Details Panel / Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedOpp(null)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl text-base-content/50 hover:bg-base-200"
            >
              <Xmark className="h-5 w-5" />
            </button>

            {/* Content */}
            {(() => {
              const startup = getStartupDetails(selectedOpp.startup_id);
              const applied = isAlreadyApplied(selectedOpp._id);

              return (
                <div className="flex flex-col gap-6">
                  {/* Header info */}
                  <div className="flex items-center gap-4 border-b border-base-200 pb-5">
                    {startup.logo ? (
                      <img
                        src={startup.logo}
                        alt={startup.startup_name}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                        {startup.startup_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-base-content">
                        {selectedOpp.role_title}
                      </h3>
                      <p className="text-sm font-semibold text-primary">
                        {startup.startup_name}
                      </p>
                      <p className="text-xs text-base-content/50 mt-0.5">
                        {startup.industry} • {startup.description?.slice(0, 80)}...
                      </p>
                    </div>
                  </div>

                  {/* Quick Meta Grid */}
                  <div className="grid grid-cols-2 gap-4 rounded-2xl bg-base-200/50 p-4 text-sm text-base-content">
                    <div>
                      <span className="text-xs text-base-content/50 block">Work Type</span>
                      <span className="font-semibold mt-0.5 flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-primary" />
                        {selectedOpp.work_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-base-content/50 block">Commitment Level</span>
                      <span className="font-semibold mt-0.5 flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        {selectedOpp.commitment_level}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-base-content/50 block">Deadline</span>
                      <span className="font-semibold mt-0.5 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        {selectedOpp.deadline ? new Date(selectedOpp.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-base-content/50 block">Compensation</span>
                      <span className="font-semibold mt-0.5 flex items-center gap-1.5 text-emerald-600">
                        <CircleDollar className="h-4 w-4" />
                        {selectedOpp.compensation ? `$${selectedOpp.compensation.toLocaleString()} / mo` : "Unspecified"}
                      </span>
                    </div>
                  </div>

                  {/* Description / Info */}
                  <div>
                    <h4 className="font-bold text-base-content text-sm mb-2">Role Overview</h4>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                      {selectedOpp.description || "The founder has not provided a detailed description for this role. However, they are looking for talented collaborators with the required skills."}
                    </p>
                  </div>

                  {/* Skills Required */}
                  <div>
                    <h4 className="font-bold text-base-content text-sm mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(selectedOpp.required_skills)
                        ? selectedOpp.required_skills
                        : selectedOpp.required_skills?.split(",") || []
                      ).map((skill, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary"
                        >
                          <Tag className="h-3 w-3" />
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 border-t border-base-200 pt-5">
                    <button
                      onClick={() => setSelectedOpp(null)}
                      className="flex-1 rounded-2xl border border-base-300 py-3 font-semibold text-base-content/70 transition hover:bg-base-200"
                    >
                      Close Details
                    </button>
                    {applied ? (
                      <button
                        disabled
                        className="flex-1 rounded-2xl bg-emerald-100 py-3 font-semibold text-emerald-700"
                      >
                        Applied Successfully
                      </button>
                    ) : user?.role === "collaborator" ? (
                      <button
                        onClick={() => handleApplyClick(selectedOpp)}
                        className="flex-1 rounded-2xl bg-primary py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        Apply for Role
                      </button>
                    ) : (
                      <div className="relative flex-1 group/btn">
                        <button
                          disabled
                          className="w-full cursor-not-allowed rounded-2xl bg-base-200 py-3 font-semibold text-base-content/40"
                        >
                          Apply for Role
                        </button>
                        <div className="pointer-events-none absolute -top-10 right-0 z-10 hidden w-max max-w-[200px] rounded-xl bg-base-content px-3 py-1.5 text-center text-xs text-base-100 shadow-lg group-hover/btn:block">
                          Only collaborators can apply
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Apply Form Modal */}
      {showApplyModal && selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-base-200 bg-base-100 p-6 shadow-xl">
            {/* Close Button */}
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl text-base-content/50 hover:bg-base-200"
            >
              <Xmark className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-base-content mb-2">
              Apply to Opportunity
            </h3>
            <p className="text-xs text-base-content/50 mb-5">
              Role: <span className="font-semibold text-primary">{selectedOpp.role_title}</span>
            </p>

            <form onSubmit={handleApplySubmit} className="flex flex-col gap-4">
              {/* Opportunity ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-base-content/70">
                  Opportunity ID
                </label>
                <input
                  type="text"
                  value={selectedOpp._id}
                  disabled
                  className="w-full rounded-xl border border-base-300 bg-base-200 px-4 py-2.5 text-xs text-base-content/50 outline-none"
                />
              </div>

              {/* Applicant Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-base-content/70">
                  Applicant Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-xl border border-base-300 bg-base-200 px-4 py-2.5 text-xs text-base-content/50 outline-none"
                />
              </div>

              {/* Portfolio Link */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-base-content">
                  Portfolio Link
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://github.com/my-profile"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-xs outline-none transition focus:border-primary"
                  required
                />
              </div>

              {/* Motivation Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-base-content">
                  Motivation Message
                </label>
                <textarea
                  placeholder="Explain why you're a great fit for this opportunity..."
                  value={motivationMessage}
                  onChange={(e) => setMotivationMessage(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-xs outline-none transition focus:border-primary"
                  required
                />
              </div>

              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 rounded-2xl border border-base-300 py-3.5 text-xs font-semibold text-base-content/70 transition hover:bg-base-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-primary py-3.5 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
