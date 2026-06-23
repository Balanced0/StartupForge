"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpFromSquare,
  Xmark,
  CirclePlus,
  Check,
} from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CollaboratorProfilePage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [profile, setProfile] = useState({
    name: "",
    image: "",
    skills: [],
    bio: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/users/${user.email}`);
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        
        if (data && Object.keys(data).length > 0) {
          setProfile({
            name: data.name || user.name || "",
            image: data.image || user.image || "",
            skills: Array.isArray(data.skills) ? data.skills : [],
            bio: data.bio || "",
          });
        } else {
          setProfile({
            name: user.name || "",
            image: user.image || "",
            skills: [],
            bio: "",
          });
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.email]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile image must be under 2MB.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (data.success) {
        setProfile((prev) => ({ ...prev, image: data.data.url }));
        showToast("Image uploaded successfully!");
      } else {
        setError("Image upload failed. Try again.");
      }
    } catch {
      setError("Image upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const skill = newSkill.trim();
    if (!skill) return;

    if (profile.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setError("Skill already added.");
      return;
    }

    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));
    setNewSkill("");
    setError("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!profile.name) {
      setError("Name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${user.email}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error();

      showToast("Profile updated successfully!");
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="h-10 w-1/4 animate-pulse rounded bg-base-200" />
        <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 animate-pulse rounded-full bg-base-200" />
              <div className="h-6 w-32 animate-pulse rounded bg-base-200" />
            </div>
            <div className="h-10 animate-pulse rounded bg-base-200" />
            <div className="h-32 animate-pulse rounded bg-base-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Toast */}
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
        <h2 className="text-2xl font-bold text-base-content">My Profile</h2>
        <p className="mt-1 text-sm text-base-content/50">
          Customize your profile, add skills, and update your information
        </p>
      </div>

      {/* Profile Form Container */}
      <div className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm sm:p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Avatar Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-base-content">
              Profile Photo
            </label>
            <label className="flex cursor-pointer flex-wrap items-center gap-4">
              <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-primary bg-primary/10">
                {uploading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : profile.image ? (
                  <img
                    src={profile.image}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-lg text-primary">
                    {profile.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm font-semibold text-primary flex items-center gap-1.5 hover:underline">
                  <ArrowUpFromSquare className="h-3.5 w-3.5" />
                  {profile.image ? "Change picture" : "Upload picture"}
                </span>
                <p className="text-xs text-base-content/40 mt-0.5">
                  JPG or PNG, up to 2MB. Uploaded via ImgBB.
                </p>
              </div>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-base-content">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none transition focus:border-primary"
              required
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-base-content">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell startups about yourself, your background, and what roles you are seeking..."
              rows={4}
              className="w-full resize-none rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
          </div>

          {/* Skills Management */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-base-content">
              Skills
            </label>
            
            {/* Tag Pills Display */}
            {profile.skills.length === 0 ? (
              <p className="text-xs text-base-content/40 italic mb-1">
                No skills added yet. Add skills below to stand out to founders.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
                    >
                      <Xmark className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skill Input Row */}
            <div className="flex max-w-md gap-2">
              <input
                type="text"
                placeholder="e.g. Next.js, Product Design"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
                className="flex-1 rounded-xl border border-base-300 bg-base-100 px-4 py-2.5 text-sm outline-none transition focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary/90"
              >
                <CirclePlus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Submit */}
          <div className="border-t border-base-200 pt-5 flex justify-end">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="rounded-2xl bg-primary px-6 py-3.5 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
            >
              {submitting ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
