"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Briefcase,
  Building2,
  GraduationCap,
  Loader2,
  Save,
  User,
} from "lucide-react";

import api from "@/services/api";

interface MentorProfile {
  id: number;
  user_id: number;
  title?: string | null;
  company?: string | null;
  experience?: string | null;
  education?: string | null;
  bio?: string | null;
  skills?: string | null;
  linkedin?: string | null;
  price: number;
  is_approved: boolean;
  is_active: boolean;
  rating: number;
  total_reviews: number;
}

interface MentorProfileFormProps {
  onSaved?: (mentor: MentorProfile) => void;
}

interface FormData {
  title: string;
  company: string;
  experience: string;
  education: string;
  bio: string;
  skills: string;
  linkedin: string;
  price: string;
}

const initialForm: FormData = {
  title: "",
  company: "",
  experience: "",
  education: "",
  bio: "",
  skills: "",
  linkedin: "",
  price: "0",
};

export default function MentorProfileForm({
  onSaved,
}: MentorProfileFormProps) {
  const [form, setForm] =
    useState<FormData>(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<MentorProfile>(
            "/mentors/me"
          );

        const mentor = response.data;

        setForm({
          title: mentor.title ?? "",
          company: mentor.company ?? "",
          experience: mentor.experience ?? "",
          education: mentor.education ?? "",
          bio: mentor.bio ?? "",
          skills: mentor.skills ?? "",
          linkedin: mentor.linkedin ?? "",
          price: String(mentor.price ?? 0),
        });
      } catch (err: unknown) {
        const message =
          err &&
          typeof err === "object" &&
          "response" in err &&
          typeof err.response === "object" &&
          err.response !== null &&
          "data" in err.response &&
          typeof err.response.data === "object" &&
          err.response.data !== null &&
          "detail" in err.response.data &&
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : "Unable to load mentor profile.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Professional title is required.");
      return;
    }

    if (!form.bio.trim()) {
      setError("Professional bio is required.");
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid session price.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        company: form.company.trim(),
        experience: form.experience.trim(),
        education: form.education.trim(),
        bio: form.bio.trim(),
        skills: form.skills.trim(),
        linkedin: form.linkedin.trim(),
        price,
      };

      const response =
        await api.put<MentorProfile>(
          "/mentors/me",
          payload
        );

      setSuccess(
        "Mentor profile saved successfully."
      );

      onSaved?.(response.data);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "detail" in err.response.data &&
        typeof err.response.data.detail === "string"
          ? err.response.data.detail
          : "Unable to save mentor profile.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-12 text-white">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8"
    >
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500/10 p-3">
            <User className="h-6 w-6 text-indigo-400" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Mentor Profile
            </h2>

            <p className="text-sm text-slate-500">
              Tell students about your professional
              experience and expertise.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">

        {/* TITLE */}

        <div>
          <label
            htmlFor="mentor-title"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Professional Title *
          </label>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              id="mentor-title"
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value
                )
              }
              placeholder="Senior Software Engineer"
              maxLength={150}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* COMPANY */}

        <div>
          <label
            htmlFor="mentor-company"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Company
          </label>

          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              id="mentor-company"
              value={form.company}
              onChange={(event) =>
                updateField(
                  "company",
                  event.target.value
                )
              }
              placeholder="Google / Microsoft / Startup"
              maxLength={150}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* EXPERIENCE */}

        <div>
          <label
            htmlFor="mentor-experience"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Experience
          </label>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              id="mentor-experience"
              value={form.experience}
              onChange={(event) =>
                updateField(
                  "experience",
                  event.target.value
                )
              }
              placeholder="8+ years"
              maxLength={100}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* EDUCATION */}

        <div>
          <label
            htmlFor="mentor-education"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Education
          </label>

          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              id="mentor-education"
              value={form.education}
              onChange={(event) =>
                updateField(
                  "education",
                  event.target.value
                )
              }
              placeholder="B.Tech Computer Science"
              maxLength={255}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* LINKEDIN */}

        <div>
          <label
            htmlFor="mentor-linkedin"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            LinkedIn Profile
          </label>

          <div className="relative">
             <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              id="mentor-linkedin"
              type="url"
              value={form.linkedin}
              onChange={(event) =>
                updateField(
                  "linkedin",
                  event.target.value
                )
              }
              placeholder="https://linkedin.com/in/your-profile"
              maxLength={500}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* PRICE */}

        <div>
          <label
            htmlFor="mentor-price"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Session Price (₹)
          </label>

          <input
            id="mentor-price"
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={(event) =>
              updateField(
                "price",
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />

          <p className="mt-1 text-xs text-slate-500">
            Enter 0 for free mentoring.
          </p>
        </div>
      </div>

      {/* SKILLS */}

      <div className="mt-6">
        <label
          htmlFor="mentor-skills"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Skills & Expertise
        </label>

        <input
          id="mentor-skills"
          value={form.skills}
          onChange={(event) =>
            updateField(
              "skills",
              event.target.value
            )
          }
          placeholder="Python, FastAPI, AWS, Docker, Kubernetes"
          maxLength={2000}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
        />

        <p className="mt-1 text-xs text-slate-500">
          Separate skills with commas.
        </p>
      </div>

      {/* BIO */}

      <div className="mt-6">
        <label
          htmlFor="mentor-bio"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Professional Bio *
        </label>

        <textarea
          id="mentor-bio"
          value={form.bio}
          onChange={(event) =>
            updateField(
              "bio",
              event.target.value
            )
          }
          placeholder="Describe your experience, expertise and how you can help students."
          maxLength={5000}
          rows={7}
          className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
        />

        <div className="mt-1 text-right text-xs text-slate-500">
          {form.bio.length}/5000
        </div>
      </div>

      {/* SAVE */}

      <div className="mt-8 flex justify-end border-t border-slate-800 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Profile
            </>
          )}
        </button>
      </div>
    </form>
  );
}