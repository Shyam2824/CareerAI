"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Star,
  CheckCircle,
} from "lucide-react";

import api from "@/services/api";
import MentorReviews from "@/components/MentorReviews";

interface Mentor {
  id: number;
  user_id: number;
  title: string | null;
  company: string | null;
  experience: string | null;
  education: string | null;
  bio: string | null;
  skills: string | null;
  linkedin: string | null;
  price: number;
  is_approved: boolean;
  is_active: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      detail?: unknown;
    };
  };
}

/* =========================================================
   ERROR HANDLER
========================================================= */

function getErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error
  ) {
    const apiError = error as ApiErrorResponse;

    const detail = apiError.response?.data?.detail;

    // Normal FastAPI string error
    if (typeof detail === "string") {
      return detail;
    }

    // FastAPI 422 validation error
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (
            item &&
            typeof item === "object" &&
            "msg" in item
          ) {
            return String(
              (item as { msg?: unknown }).msg ||
                "Validation error"
            );
          }

          return "Validation error";
        })
        .join(", ");
    }

    if (apiError.response?.status === 404) {
      return "Mentor not found.";
    }

    if (apiError.response?.status === 401) {
      return "Please login to continue.";
    }

    return "Unable to load mentor.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load mentor.";
}

/* =========================================================
   PAGE
========================================================= */

export default function MentorDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  /* =======================================================
     GET MENTOR ID
  ======================================================= */

  const mentorId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  /* =======================================================
     FETCH MENTOR
  ======================================================= */

  const fetchMentor = useCallback(async () => {
    if (!mentorId) {
      setError("Mentor ID is missing.");
      setLoading(false);
      return;
    }

    // Make sure we never send {mentor_id}
    if (
      mentorId === "{mentor_id}" ||
      mentorId.includes("{") ||
      mentorId.includes("}")
    ) {
      setError("Invalid mentor ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log(
        "[MENTOR] Fetching mentor:",
        mentorId
      );

      console.log(
        "[MENTOR] API URL:",
        `/mentors/${mentorId}`
      );

      /*
       * IMPORTANT:
       * Correct dynamic URL
       *
       * /mentors/1
       *
       * NOT:
       *
       * /mentors/{mentor_id}
       */

      const response = await api.get<Mentor>(
        `/mentors/${encodeURIComponent(String(mentorId))}`
      );

      console.log(
        "[MENTOR] Response:",
        response.data
      );

      setMentor(response.data);
    } catch (err: unknown) {
      console.error(
        "[MENTOR] Failed to fetch mentor:",
        err
      );

      setError(getErrorMessage(err));
      setMentor(null);
    } finally {
      setLoading(false);
    }
  }, [mentorId]);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMentor();
  }, [fetchMentor]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />

            <p className="text-slate-400">
              Loading mentor...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !mentor) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">

          <button
            type="button"
            onClick={() => router.push("/mentors")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={18} />

            Back to Mentors
          </button>

          <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">

            <h2 className="text-xl font-semibold text-red-300">
              Unable to Load Mentor
            </h2>

            <p className="text-red-300/80 mt-2">
              {typeof error === "string"
                ? error
                : "Mentor not found."}
            </p>

            <div className="flex gap-3 mt-5">

              <button
                type="button"
                onClick={fetchMentor}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() => router.push("/mentors")}
                className="px-5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
              >
                View Mentors
              </button>

            </div>
          </div>

        </div>
      </main>
    );
  }

  /* =======================================================
     SKILLS
  ======================================================= */

  const skills = mentor.skills
    ? mentor.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)
    : [];

  /* =======================================================
     RATING
  ======================================================= */

  const rating =
    typeof mentor.rating === "number"
      ? mentor.rating
      : Number(mentor.rating || 0);

  /* =======================================================
     PRICE
  ======================================================= */

  const price =
    typeof mentor.price === "number"
      ? mentor.price
      : Number(mentor.price || 0);

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() => router.push("/mentors")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
        >
          <ArrowLeft size={18} />

          Back to Mentors
        </button>

        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

            {/* PROFILE INFORMATION */}

            <div className="flex-1">

              <div className="flex items-start gap-4">

                {/* PROFILE AVATAR */}

                <div className="w-16 h-16 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold">
                  {mentor.title
                    ? mentor.title
                        .charAt(0)
                        .toUpperCase()
                    : "M"}
                </div>

                <div>

                  <h1 className="text-2xl md:text-3xl font-bold">
                    {mentor.title || "Career Mentor"}
                  </h1>

                  {mentor.company && (
                    <p className="text-slate-400 mt-1">
                      {mentor.company}
                    </p>
                  )}

                </div>

              </div>

              {/* RATING */}

              <div className="flex items-center gap-2 mt-5">

                <Star
                  size={18}
                  className="fill-yellow-400 text-yellow-400"
                />

                <span className="font-semibold">
                  {rating.toFixed(1)}
                </span>

                <span className="text-slate-500">
                  ({mentor.total_reviews || 0} reviews)
                </span>

              </div>

              {/* VERIFIED */}

              {mentor.is_approved && (
                <div className="flex items-center gap-2 mt-4 text-green-400 text-sm">
                  <CheckCircle size={17} />

                  <span>
                    Verified Mentor
                  </span>
                </div>
              )}

            </div>

            {/* =================================================
                PRICE CARD
            ================================================= */}

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 w-full md:w-52">

              <p className="text-sm text-slate-400">
                Session Price
              </p>

              <p className="text-3xl font-bold mt-1">
                ₹{price}
              </p>

              <p className="text-sm text-slate-500">
                per session
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/mentors/${mentor.id}/book`
                  )
                }
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-medium transition"
              >
                Book Session
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="md:col-span-2 space-y-6">

            {/* ABOUT */}

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <h2 className="text-xl font-semibold mb-4">
                About Mentor
              </h2>

              <p className="text-slate-400 leading-7 whitespace-pre-line">
                {mentor.bio ||
                  "This mentor has not added a bio yet."}
              </p>

            </section>

            {/* SKILLS */}

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <h2 className="text-xl font-semibold mb-4">
                Skills
              </h2>

              {skills.length > 0 ? (

                <div className="flex flex-wrap gap-2">

                  {skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm"
                    >
                      {skill}
                    </span>
                  ))}

                </div>

              ) : (

                <p className="text-slate-500">
                  No skills added.
                </p>

              )}

            </section>

          </div>

          {/* =================================================
              RIGHT CONTENT
          ================================================= */}

          <div className="space-y-6">

            {/* EXPERIENCE */}

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-3">

                <Briefcase
                  size={20}
                  className="text-blue-400"
                />

                <h2 className="font-semibold">
                  Experience
                </h2>

              </div>

              <p className="text-slate-400">
                {mentor.experience ||
                  "Experience not provided."}
              </p>

            </section>

            {/* EDUCATION */}

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-3">

                <GraduationCap
                  size={20}
                  className="text-blue-400"
                />

                <h2 className="font-semibold">
                  Education
                </h2>

              </div>

              <p className="text-slate-400">
                {mentor.education ||
                  "Education not provided."}
              </p>

            </section>

            {/* LINKEDIN */}

            {mentor.linkedin && (
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <a
                  href={mentor.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full border border-slate-700 hover:bg-slate-800 py-3 rounded-xl transition"
                >
                  <Briefcase size={18} />

                  View LinkedIn Profile
                </a>

              </section>
            )}

          </div>

        </div>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <section className="mt-8">

          <MentorReviews mentorId={mentor.id} />

        </section>

        {/* =================================================
            BOTTOM CTA
        ================================================= */}

        <section className="mt-8 bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 text-center">

          <h2 className="text-xl font-semibold">
            Ready to accelerate your career?
          </h2>

          <p className="text-slate-400 mt-2">
            Book a one-on-one session with this mentor.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/mentors/${mentor.id}/book`
              )
            }
            className="mt-5 px-7 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition"
          >
            Book Mentor Session
          </button>

        </section>

      </div>

    </main>
  );
}