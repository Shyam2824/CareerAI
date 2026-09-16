"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Loader2,
  Save,
  User,
  Briefcase,
  BookOpen,
  FileText,
  Code2,
} from "lucide-react";

import api from "@/services/api";
import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "@/services/apiError";

/* ============================================================================
   TYPES
   ============================================================================ */

interface MentorForm {
  title: string;
  company: string;
  experience: string;
  education: string;
  bio: string;
  skills: string;
  linkedin: string;
  price: string;
}

/* ============================================================================
   CONSTANTS
   ============================================================================ */

const TOTAL_STEPS = 3;

const INITIAL_FORM: MentorForm = {
  title: "",
  company: "",
  experience: "",
  education: "",
  bio: "",
  skills: "",
  linkedin: "",
  price: "0",
};

/* ============================================================================
   MENTOR ONBOARDING
   Phase 22.4.6
   ============================================================================ */

export default function MentorOnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [form, setForm] =
    useState<MentorForm>(INITIAL_FORM);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>({});

  /* ==========================================================================
     UPDATE FIELD
     ========================================================================== */

  const updateField = (
    field: keyof MentorForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");

    setFieldErrors((previous) => {
      const updated = {
        ...previous,
      };

      delete updated[field];

      return updated;
    });
  };

  /* ==========================================================================
     STEP 1 VALIDATION
     ========================================================================== */

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    const title = form.title.trim();
    const company = form.company.trim();
    const experience = form.experience.trim();
    const education = form.education.trim();

    if (!title) {
      errors.title =
        "Please enter your professional title.";
    } else if (title.length < 2) {
      errors.title =
        "Professional title must contain at least 2 characters.";
    } else if (title.length > 150) {
      errors.title =
        "Professional title must contain fewer than 150 characters.";
    }

    if (!company) {
      errors.company =
        "Please enter your company.";
    } else if (company.length < 2) {
      errors.company =
        "Company name must contain at least 2 characters.";
    } else if (company.length > 150) {
      errors.company =
        "Company name must contain fewer than 150 characters.";
    }

    if (!experience) {
      errors.experience =
        "Please enter your experience.";
    } else if (experience.length > 100) {
      errors.experience =
        "Experience must contain fewer than 100 characters.";
    }

    if (!education) {
      errors.education =
        "Please enter your education.";
    } else if (education.length > 255) {
      errors.education =
        "Education must contain fewer than 255 characters.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ==========================================================================
     STEP 2 VALIDATION
     ========================================================================== */

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    const bio = form.bio.trim();
    const skills = form.skills.trim();

    if (!bio) {
      errors.bio =
        "Please enter your mentor bio.";
    } else if (bio.length < 20) {
      errors.bio =
        "Bio must contain at least 20 characters.";
    } else if (bio.length > 3000) {
      errors.bio =
        "Bio must contain fewer than 3000 characters.";
    }

    if (!skills) {
      errors.skills =
        "Please enter your skills.";
    } else if (skills.length < 2) {
      errors.skills =
        "Please enter at least one skill.";
    } else if (skills.length > 1000) {
      errors.skills =
        "Skills must contain fewer than 1000 characters.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ==========================================================================
     STEP 3 VALIDATION
     ========================================================================== */

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};

    const linkedin =
      form.linkedin.trim();

    const price =
      Number(form.price);

    /* -------------------------- LinkedIn -------------------------- */

    if (linkedin) {
      try {
        const url = new URL(linkedin);

        if (
          url.protocol !== "http:" &&
          url.protocol !== "https:"
        ) {
          errors.linkedin =
            "Please enter a valid LinkedIn URL.";
        }
      } catch {
        errors.linkedin =
          "Please enter a valid LinkedIn URL.";
      }
    }

    /* ---------------------------- Price --------------------------- */

    if (form.price.trim() === "") {
      errors.price =
        "Please enter a session price.";
    } else if (Number.isNaN(price)) {
      errors.price =
        "Please enter a valid price.";
    } else if (price < 0) {
      errors.price =
        "Price cannot be negative.";
    } else if (price > 100000) {
      errors.price =
        "Price cannot exceed ₹100,000.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ==========================================================================
     NEXT STEP
     ========================================================================== */

  const nextStep = () => {
    setError("");

    let valid = false;

    if (step === 1) {
      valid = validateStep1();
    }

    if (step === 2) {
      valid = validateStep2();
    }

    if (!valid) {
      return;
    }

    setStep((previous) =>
      Math.min(
        previous + 1,
        TOTAL_STEPS
      )
    );
  };

  /* ==========================================================================
     PREVIOUS STEP
     ========================================================================== */

  const previousStep = () => {
    setError("");
    setFieldErrors({});

    setStep((previous) =>
      Math.max(previous - 1, 1)
    );
  };

  /* ==========================================================================
     SUBMIT
     
     IMPORTANT:
     No FormEvent parameter.
     This allows onClick={submit} without TypeScript error.
     ========================================================================== */

  const submit = async () => {
    if (loading) {
      return;
    }

    setError("");
    setFieldErrors({});

    /* Validate final step */

    if (!validateStep3()) {
      return;
    }

    try {
      setLoading(true);

      /* ----------------------------------------------------------------------
         Create mentor profile
         ---------------------------------------------------------------------- */

      await api.post(
        "/mentors/onboarding",
        {
          title: form.title.trim(),

          company: form.company.trim(),

          experience:
            form.experience.trim(),

          education:
            form.education.trim(),

          bio: form.bio.trim(),

          skills:
            form.skills.trim(),

          linkedin:
            form.linkedin.trim() || null,

          price:
            Number(form.price) || 0,
        }
      );

      /* ----------------------------------------------------------------------
         Success
         ---------------------------------------------------------------------- */

      router.push(
        "/mentor/profile"
      );
    } catch (err) {
      console.error(
        "Mentor onboarding failed:",
        err
      );

      /* ----------------------------------------------------------------------
         Field-level backend errors
         ---------------------------------------------------------------------- */

      const apiFields =
        getApiFieldErrors(err);

      if (apiFields.length > 0) {
        const mapped: Record<
          string,
          string
        > = {};

        apiFields.forEach((item) => {
          if (item.field) {
            mapped[item.field] =
              item.message;
          }
        });

        setFieldErrors(mapped);
      }

      /* ----------------------------------------------------------------------
         General backend error
         ---------------------------------------------------------------------- */

      setError(
        getApiErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================================
     STEP TITLE
     ========================================================================== */

  const stepTitle = [
    "Professional Information",
    "About & Skills",
    "Session Details",
  ][step - 1];

  /* ==========================================================================
     UI
     ========================================================================== */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">

      <div className="mx-auto w-full max-w-3xl">

        {/* ==================================================================
            HEADER
            ================================================================== */}

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <GraduationCap
              size={32}
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Build Your Mentor Profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Tell students about your experience,
            expertise and mentoring services.
          </p>

        </div>

        {/* ==================================================================
            PROGRESS
            ================================================================== */}

        <div className="mb-8">

          <div className="mb-3 flex items-center justify-between text-sm">

            <span className="font-medium text-slate-300">
              Step {step} of {TOTAL_STEPS}
            </span>

            <span className="text-slate-500">
              {stepTitle}
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-800">

            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{
                width: `${
                  (step / TOTAL_STEPS) *
                  100
                }%`,
              }}
            />

          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">

            {[
              "Professional",
              "About & Skills",
              "Session",
            ].map(
              (label, index) => {
                const number =
                  index + 1;

                const active =
                  number === step;

                const completed =
                  number < step;

                return (
                  <div
                    key={label}
                    className="flex items-center gap-2"
                  >

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        completed
                          ? "bg-emerald-500 text-white"
                          : active
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {completed ? (
                        <Check size={16} />
                      ) : (
                        number
                      )}
                    </div>

                    <span
                      className={`hidden text-xs sm:block ${
                        active
                          ? "text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {label}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* ==================================================================
            MAIN CARD
            ================================================================== */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

          {/* =================================================================
              ERROR
              ================================================================= */}

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-300"
            >
              {error}
            </div>
          )}

          {/* =================================================================
              STEP 1
              ================================================================= */}

          {step === 1 && (
            <div className="space-y-6">

              <div>
                <h2 className="text-xl font-bold">
                  Professional Information
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Add the information students will see
                  on your mentor profile.
                </p>
              </div>

              <InputField
                id="title"
                label="Professional Title"
                value={form.title}
                placeholder="e.g. Senior Software Engineer"
                icon={
                  <Briefcase size={18} />
                }
                error={
                  fieldErrors.title
                }
                disabled={loading}
                onChange={(value) =>
                  updateField(
                    "title",
                    value
                  )
                }
              />

              <InputField
                id="company"
                label="Company"
                value={form.company}
                placeholder="e.g. Google"
                icon={
                  <Briefcase size={18} />
                }
                error={
                  fieldErrors.company
                }
                disabled={loading}
                onChange={(value) =>
                  updateField(
                    "company",
                    value
                  )
                }
              />

              <InputField
                id="experience"
                label="Experience"
                value={form.experience}
                placeholder="e.g. 5+ years"
                icon={
                  <User size={18} />
                }
                error={
                  fieldErrors.experience
                }
                disabled={loading}
                onChange={(value) =>
                  updateField(
                    "experience",
                    value
                  )
                }
              />

              <InputField
                id="education"
                label="Education"
                value={form.education}
                placeholder="e.g. B.Tech in Computer Science"
                icon={
                  <BookOpen size={18} />
                }
                error={
                  fieldErrors.education
                }
                disabled={loading}
                onChange={(value) =>
                  updateField(
                    "education",
                    value
                  )
                }
              />

            </div>
          )}

          {/* =================================================================
              STEP 2
              ================================================================= */}

          {step === 2 && (
            <div className="space-y-6">

              <div>
                <h2 className="text-xl font-bold">
                  About & Skills
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Help students understand what you
                  can help them with.
                </p>
              </div>

              {/* Bio */}

              <div>

                <label
                  htmlFor="bio"
                  className="text-sm font-medium text-slate-300"
                >
                  Mentor Bio
                </label>

                <div className="relative mt-2">

                  <FileText
                    size={18}
                    className="absolute left-3 top-3 text-slate-500"
                    aria-hidden="true"
                  />

                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={(event) =>
                      updateField(
                        "bio",
                        event.target.value
                      )
                    }
                    placeholder="Tell students about your professional experience, expertise and how you can help them..."
                    disabled={loading}
                    rows={7}
                    maxLength={3000}
                    className={`w-full resize-none rounded-xl border ${
                      fieldErrors.bio
                        ? "border-red-500"
                        : "border-slate-700"
                    } bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60`}
                  />

                </div>

                <div className="mt-1 flex justify-between">

                  {fieldErrors.bio ? (
                    <p className="text-xs text-red-400">
                      {fieldErrors.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Minimum 20 characters.
                    </p>
                  )}

                  <p className="text-xs text-slate-500">
                    {form.bio.length}/3000
                  </p>

                </div>

              </div>

              {/* Skills */}

              <div>

                <label
                  htmlFor="skills"
                  className="text-sm font-medium text-slate-300"
                >
                  Skills
                </label>

                <div className="relative mt-2">

                  <Code2
                    size={18}
                    className="absolute left-3 top-3 text-slate-500"
                    aria-hidden="true"
                  />

                  <textarea
                    id="skills"
                    value={form.skills}
                    onChange={(event) =>
                      updateField(
                        "skills",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Java, Spring Boot, AWS, Docker, Kubernetes, React"
                    disabled={loading}
                    rows={4}
                    maxLength={1000}
                    className={`w-full resize-none rounded-xl border ${
                      fieldErrors.skills
                        ? "border-red-500"
                        : "border-slate-700"
                    } bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60`}
                  />

                </div>

                <div className="mt-1 flex justify-between">

                  {fieldErrors.skills ? (
                    <p className="text-xs text-red-400">
                      {fieldErrors.skills}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Separate skills with commas.
                    </p>
                  )}

                  <p className="text-xs text-slate-500">
                    {form.skills.length}/1000
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* =================================================================
              STEP 3
              ================================================================= */}

          {step === 3 && (
            <div className="space-y-6">

              <div>
                <h2 className="text-xl font-bold">
                  Session Details
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Add optional contact information and
                  your mentoring session price.
                </p>
              </div>

              {/* LinkedIn */}

              <InputField
                id="linkedin"
                label="LinkedIn Profile"
                value={form.linkedin}
                placeholder="https://www.linkedin.com/in/your-profile"
                icon={
                  <Briefcase size={18} />
                }
                error={
                  fieldErrors.linkedin
                }
                disabled={loading}
                onChange={(value) =>
                  updateField(
                    "linkedin",
                    value
                  )
                }
              />

              {/* Price */}

              <div>

                <label
                  htmlFor="price"
                  className="text-sm font-medium text-slate-300"
                >
                  Session Price
                </label>

                <div className="relative mt-2">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    ₹
                  </span>

                  <input
                    id="price"
                    type="number"
                    min="0"
                    max="100000"
                    step="1"
                    value={form.price}
                    onChange={(event) =>
                      updateField(
                        "price",
                        event.target.value
                      )
                    }
                    placeholder="0"
                    disabled={loading}
                    className={`w-full rounded-xl border ${
                      fieldErrors.price
                        ? "border-red-500"
                        : "border-slate-700"
                    } bg-slate-950 py-3 pl-9 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60`}
                  />

                </div>

                {fieldErrors.price ? (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.price}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    Enter 0 if you are offering free
                    mentoring sessions.
                  </p>
                )}

              </div>

              {/* Profile Summary */}

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

                <h3 className="font-semibold text-white">
                  Profile Summary
                </h3>

                <div className="mt-4 space-y-3 text-sm">

                  <SummaryRow
                    label="Title"
                    value={
                      form.title ||
                      "Not provided"
                    }
                  />

                  <SummaryRow
                    label="Company"
                    value={
                      form.company ||
                      "Not provided"
                    }
                  />

                  <SummaryRow
                    label="Experience"
                    value={
                      form.experience ||
                      "Not provided"
                    }
                  />

                  <SummaryRow
                    label="Education"
                    value={
                      form.education ||
                      "Not provided"
                    }
                  />

                  <SummaryRow
                    label="Skills"
                    value={
                      form.skills ||
                      "Not provided"
                    }
                  />

                  <SummaryRow
                    label="Session Price"
                    value={`₹${Number(
                      form.price || 0
                    ).toLocaleString(
                      "en-IN"
                    )}`}
                  />

                </div>

              </div>

            </div>
          )}

          {/* =================================================================
              NAVIGATION
              ================================================================= */}

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-800 pt-6">

            {/* Back / Cancel */}

            {step > 1 ? (
              <button
                type="button"
                onClick={previousStep}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={17} />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/mentor/login"
                  )
                }
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={17} />
                Cancel
              </button>
            )}

            {/* Continue */}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            ) : (

              /*
               * IMPORTANT:
               *
               * type="button"
               * + onClick={submit}
               *
               * submit() does NOT expect a FormEvent,
               * so TypeScript will not show the red line.
               */

              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                      aria-hidden="true"
                    />

                    Creating Profile...
                  </>
                ) : (
                  <>
                    <Save
                      size={17}
                      aria-hidden="true"
                    />

                    Create Mentor Profile
                  </>
                )}

              </button>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}

/* ============================================================================
   INPUT FIELD
   ============================================================================ */

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  icon: React.ReactNode;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function InputField({
  id,
  label,
  value,
  placeholder,
  icon,
  error,
  disabled = false,
  onChange,
}: InputFieldProps) {
  return (
    <div>

      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-300"
      >
        {label}
      </label>

      <div className="relative mt-2">

        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>

        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl border ${
            error
              ? "border-red-500"
              : "border-slate-700"
          } bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60`}
        />

      </div>

      {error && (
        <p className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}

    </div>
  );
}

/* ============================================================================
   SUMMARY ROW
   ============================================================================ */

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-800 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-5">

      <span className="shrink-0 text-slate-500">
        {label}
      </span>

      <span className="text-right text-slate-300">
        {value}
      </span>

    </div>
  );
}