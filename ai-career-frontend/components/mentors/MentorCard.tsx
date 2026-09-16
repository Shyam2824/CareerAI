"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Star,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

function imageUrl(path?: string | null): string {
  if (!path) {
    return "";
  }

  if (path.startsWith("http")) {
    return path;
  }

  return `${API_URL}${
    path.startsWith("/") ? path : `/${path}`
  }`;
}

type Props = {
  id: number;
  name: string;
  role: string;
  company: string;
  experience: string;
  rating: number;
  reviews: number;
  price: number;
  skills: string[];
  photo_url?: string | null;
};

export default function MentorCard({
  id,
  name,
  role,
  company,
  experience,
  rating,
  reviews,
  price,
  skills,
  photo_url,
}: Props) {
  const mentorName = name?.trim() || "Mentor";
  const mentorRole = role?.trim() || "Career Mentor";
  const mentorCompany =
    company?.trim() || "Independent Mentor";

  const mentorSkills = Array.isArray(skills)
    ? skills.filter(Boolean)
    : [];

  const formattedRating = Number(rating || 0).toFixed(1);

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* ================= PROFILE HEADER ================= */}

      <div className="flex items-start justify-between">
        {/* Profile Photo */}

        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-purple-500 to-indigo-600 text-xl font-bold text-white">
          {photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl(photo_url)}
              alt={`${mentorName} profile`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            mentorName.charAt(0).toUpperCase()
          )}
        </div>

        {/* Verified Badge */}

        <BadgeCheck
          size={22}
          className="text-blue-500"
          aria-label="Verified mentor"
        />
      </div>

      {/* ================= MENTOR INFO ================= */}

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        {mentorName}
      </h2>

      <p className="mt-1 font-medium text-purple-600">
        {mentorRole}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {mentorCompany}
      </p>

      {/* ================= EXPERIENCE ================= */}

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <Briefcase
          size={17}
          className="shrink-0"
        />

        <span>
          {experience || "Experience not specified"}{" "}
          Experience
        </span>
      </div>

      {/* ================= RATING ================= */}

      <div className="mt-4 flex items-center gap-2">
        <Star
          size={18}
          className="fill-yellow-400 text-yellow-400"
        />

        <span className="font-semibold text-slate-800">
          {formattedRating}
        </span>

        <span className="text-sm text-slate-400">
          ({reviews || 0} reviews)
        </span>
      </div>

      {/* ================= SKILLS ================= */}

      {mentorSkills.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {mentorSkills
            .slice(0, 3)
            .map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
              >
                {skill}
              </span>
            ))}
        </div>
      )}

      {/* ================= FOOTER ================= */}

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        {/* Price */}

        <div>
          <p className="text-xs text-slate-400">
            Starting from
          </p>

          <p className="font-bold text-slate-900">
            ₹{Number(price || 0).toLocaleString("en-IN")}
            <span className="ml-1 text-xs font-normal text-slate-400">
              /session
            </span>
          </p>
        </div>

        {/* View Profile */}

        <Link
          href={`/mentors/${id}`}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          <span>View</span>

          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}