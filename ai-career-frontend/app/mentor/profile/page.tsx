"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  Save,
  Star,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  IndianRupee,
} from "lucide-react";

import api from "@/services/api";
import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "@/services/apiError";

/* ============================================================================
   TYPES
   ============================================================================ */

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

  photo_url: string | null;

  is_approved: boolean;
  is_active: boolean;

  rating: number;
  total_reviews: number;

  created_at?: string;
  updated_at?: string;
}

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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const MAX_PHOTO_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/* ============================================================================
   HELPERS
   ============================================================================ */

function getPhotoUrl(
  path?: string | null
): string {
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_URL}${
    path.startsWith("/")
      ? path
      : `/${path}`
  }`;
}

function mentorToForm(
  mentor: Mentor
): MentorForm {
  return {
    title: mentor.title || "",
    company: mentor.company || "",
    experience:
      mentor.experience || "",
    education:
      mentor.education || "",
    bio: mentor.bio || "",
    skills: mentor.skills || "",
    linkedin:
      mentor.linkedin || "",
    price: String(
      mentor.price ?? 0
    ),
  };
}

/* ============================================================================
   PAGE
   ============================================================================ */

export default function MentorProfilePage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [mentor, setMentor] =
    useState<Mentor | null>(null);

  const [form, setForm] =
    useState<MentorForm>({
      title: "",
      company: "",
      experience: "",
      education: "",
      bio: "",
      skills: "",
      linkedin: "",
      price: "0",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [photoLoading, setPhotoLoading] =
    useState(false);

  const [removingPhoto, setRemovingPhoto] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>({});

  /* ==========================================================================
     LOAD PROFILE
     ========================================================================== */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<Mentor>(
          "/mentors/me"
        );

      const data = response.data;

      setMentor(data);
      setForm(
        mentorToForm(data)
      );
    } catch (err) {
      console.error(
        "Failed to load mentor profile:",
        err
      );

      const status =
        (
          err as {
            response?: {
              status?: number;
            };
          }
        )?.response?.status;

      if (status === 404) {
        router.push(
          "/mentor/onboarding"
        );
        return;
      }

      setError(
        getApiErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================================
     INITIAL LOAD
     ========================================================================== */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ==========================================================================
     FIELD UPDATE
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
    setSuccess("");

    setFieldErrors((previous) => {
      const updated = {
        ...previous,
      };

      delete updated[field];

      return updated;
    });
  };

  /* ==========================================================================
     VALIDATION
     ========================================================================== */

  const validateForm =
    (): boolean => {
      const errors: Record<
        string,
        string
      > = {};

      const title =
        form.title.trim();

      const company =
        form.company.trim();

      const experience =
        form.experience.trim();

      const education =
        form.education.trim();

      const bio =
        form.bio.trim();

      const skills =
        form.skills.trim();

      const linkedin =
        form.linkedin.trim();

      const price =
        Number(form.price);

      /* Title */

      if (!title) {
        errors.title =
          "Professional title is required.";
      } else if (title.length < 2) {
        errors.title =
          "Title must contain at least 2 characters.";
      } else if (title.length > 150) {
        errors.title =
          "Title cannot exceed 150 characters.";
      }

      /* Company */

      if (!company) {
        errors.company =
          "Company is required.";
      } else if (company.length < 2) {
        errors.company =
          "Company must contain at least 2 characters.";
      } else if (company.length > 150) {
        errors.company =
          "Company cannot exceed 150 characters.";
      }

      /* Experience */

      if (!experience) {
        errors.experience =
          "Experience is required.";
      } else if (experience.length > 100) {
        errors.experience =
          "Experience cannot exceed 100 characters.";
      }

      /* Education */

      if (!education) {
        errors.education =
          "Education is required.";
      } else if (education.length > 255) {
        errors.education =
          "Education cannot exceed 255 characters.";
      }

      /* Bio */

      if (!bio) {
        errors.bio =
          "Bio is required.";
      } else if (bio.length < 20) {
        errors.bio =
          "Bio must contain at least 20 characters.";
      } else if (bio.length > 3000) {
        errors.bio =
          "Bio cannot exceed 3000 characters.";
      }

      /* Skills */

      if (!skills) {
        errors.skills =
          "Skills are required.";
      } else if (skills.length > 1000) {
        errors.skills =
          "Skills cannot exceed 1000 characters.";
      }

      /* LinkedIn */

      if (linkedin) {
        try {
          const url =
            new URL(linkedin);

          if (
            url.protocol !==
              "http:" &&
            url.protocol !==
              "https:"
          ) {
            errors.linkedin =
              "Please enter a valid LinkedIn URL.";
          }
        } catch {
          errors.linkedin =
            "Please enter a valid LinkedIn URL.";
        }
      }

      /* Price */

      if (
        form.price.trim() === ""
      ) {
        errors.price =
          "Price is required.";
      } else if (
        Number.isNaN(price)
      ) {
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

      return (
        Object.keys(errors)
          .length === 0
      );
    };

  /* ==========================================================================
     SAVE PROFILE
     ========================================================================== */

  const saveProfile =
    async () => {
      if (saving) {
        return;
      }

      setError("");
      setSuccess("");

      if (!validateForm()) {
        return;
      }

      try {
        setSaving(true);

        const response =
          await api.put<Mentor>(
            "/mentors/me",
            {
              title:
                form.title.trim(),

              company:
                form.company.trim(),

              experience:
                form.experience.trim(),

              education:
                form.education.trim(),

              bio:
                form.bio.trim(),

              skills:
                form.skills.trim(),

              linkedin:
                form.linkedin.trim() ||
                null,

              price:
                Number(form.price) || 0,
            }
          );

        setMentor(
          response.data
        );

        setForm(
          mentorToForm(
            response.data
          )
        );

        setSuccess(
          "Mentor profile updated successfully."
        );
      } catch (err) {
        console.error(
          "Failed to update mentor profile:",
          err
        );

        const apiFields =
          getApiFieldErrors(err);

        if (
          apiFields.length > 0
        ) {
          const mapped: Record<
            string,
            string
          > = {};

          apiFields.forEach(
            (item) => {
              if (item.field) {
                mapped[item.field] =
                  item.message;
              }
            }
          );

          setFieldErrors(mapped);
        }

        setError(
          getApiErrorMessage(err)
        );
      } finally {
        setSaving(false);
      }
    };

  /* ==========================================================================
     PHOTO SELECT
     ========================================================================== */

  const handlePhotoSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    /* Reset input */

    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    /* File type */

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      setError(
        "Only JPG, PNG and WEBP images are allowed."
      );

      return;
    }

    /* File size */

    if (
      file.size >
      MAX_PHOTO_SIZE
    ) {
      setError(
        "Profile photo must be 5 MB or smaller."
      );

      return;
    }

    try {
      setPhotoLoading(true);

      const formData =
        new FormData();

      /*
       * IMPORTANT:
       * Backend endpoint expects "photo".
       */

      formData.append(
        "photo",
        file
      );

      const response =
        await api.post<Mentor>(
          "/mentors/me/photo",
          formData
        );

      setMentor(
        response.data
      );

      setSuccess(
        "Profile photo updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to upload mentor photo:",
        err
      );

      setError(
        getApiErrorMessage(err)
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  /* ==========================================================================
     REMOVE PHOTO
     ========================================================================== */

  const removePhoto =
    async () => {
      if (
        removingPhoto ||
        !mentor?.photo_url
      ) {
        return;
      }

      setError("");
      setSuccess("");

      try {
        setRemovingPhoto(
          true
        );

        const response =
          await api.delete<Mentor>(
            "/mentors/me/photo"
          );

        setMentor(
          response.data
        );

        setSuccess(
          "Profile photo removed successfully."
        );
      } catch (err) {
        console.error(
          "Failed to remove mentor photo:",
          err
        );

        setError(
          getApiErrorMessage(err)
        );
      } finally {
        setRemovingPhoto(
          false
        );
      }
    };

  /* ==========================================================================
     LOADING STATE
     ========================================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">

        <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">

          <div className="text-center">

            <Loader2
              size={38}
              className="mx-auto animate-spin text-indigo-500"
            />

            <p className="mt-4 text-sm text-slate-400">
              Loading your mentor profile...
            </p>

          </div>

        </div>

      </main>
    );
  }

  /* ==========================================================================
     NO PROFILE
     ========================================================================== */

  if (!mentor) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">

            <User
              size={40}
              className="mx-auto text-slate-500"
            />

            <h1 className="mt-4 text-xl font-bold">
              Mentor profile not found
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Please complete your mentor onboarding first.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/mentor/onboarding"
                )
              }
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Complete Onboarding
            </button>

          </div>

        </div>

      </main>
    );
  }

  /* ==========================================================================
     MAIN UI
     ========================================================================== */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* ==================================================================
            HEADER
            ================================================================== */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/mentor/dashboard"
                )
              }
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
              <ArrowLeft
                size={17}
              />
              Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold">
              Mentor Profile
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage your professional information
              and mentor profile.
            </p>

          </div>

          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Save
                  size={17}
                />

                Save Changes
              </>
            )}

          </button>

        </div>

        {/* ==================================================================
            ALERTS
            ================================================================== */}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
          >
            <CheckCircle2
              size={18}
            />

            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">

          {/* ==================================================================
              LEFT SIDEBAR
              ================================================================== */}

          <aside className="space-y-6">

            {/* Profile photo */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="text-center">

                <div className="relative mx-auto h-32 w-32">

                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-slate-800 bg-slate-800 text-4xl font-bold text-slate-300">

                    {mentor.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getPhotoUrl(
                          mentor.photo_url
                        )}
                        alt="Mentor profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (
                        mentor.title ||
                        "M"
                      )
                        .charAt(0)
                        .toUpperCase()
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={
                      photoLoading ||
                      removingPhoto
                    }
                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-900 bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Change profile photo"
                  >

                    {photoLoading ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Camera
                        size={17}
                      />
                    )}

                  </button>

                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handlePhotoSelect
                  }
                  className="hidden"
                />

                <h2 className="mt-5 text-lg font-bold">
                  {mentor.title ||
                    "Mentor"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {mentor.company ||
                    "Company not provided"}
                </p>

                <p className="mt-4 text-xs text-slate-500">
                  JPG, PNG or WEBP
                  <br />
                  Maximum size: 5 MB
                </p>

                {mentor.photo_url && (
                  <button
                    type="button"
                    onClick={
                      removePhoto
                    }
                    disabled={
                      removingPhoto ||
                      photoLoading
                    }
                    className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
                  >

                    {removingPhoto ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2
                        size={14}
                      />
                    )}

                    Remove Photo

                  </button>
                )}

              </div>

            </section>

            {/* Profile status */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <h3 className="font-semibold">
                Profile Status
              </h3>

              <div className="mt-5 space-y-4">

                <StatusRow
                  label="Approval"
                  value={
                    mentor.is_approved
                      ? "Approved"
                      : "Pending"
                  }
                  active={
                    mentor.is_approved
                  }
                />

                <StatusRow
                  label="Account"
                  value={
                    mentor.is_active
                      ? "Active"
                      : "Inactive"
                  }
                  active={
                    mentor.is_active
                  }
                />

                <StatusRow
                  label="Rating"
                  value={`${Number(
                    mentor.rating || 0
                  ).toFixed(1)} / 5`}
                  icon={
                    <Star
                      size={15}
                      className="fill-current"
                    />
                  }
                  active
                />

                <StatusRow
                  label="Reviews"
                  value={String(
                    mentor.total_reviews ||
                      0
                  )}
                  active
                />

              </div>

            </section>

          </aside>

          {/* ==================================================================
              PROFILE FORM
              ================================================================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

            <div className="mb-8">

              <h2 className="text-xl font-bold">
                Professional Information
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Keep your mentor profile accurate and
                up to date.
              </p>

            </div>

            <div className="grid gap-6 sm:grid-cols-2">

              <InputField
                id="title"
                label="Professional Title"
                value={form.title}
                placeholder="e.g. Senior Software Engineer"
                icon={
                  <Briefcase
                    size={18}
                  />
                }
                error={
                  fieldErrors.title
                }
                disabled={saving}
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
                  <Briefcase
                    size={18}
                  />
                }
                error={
                  fieldErrors.company
                }
                disabled={saving}
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
                  <User
                    size={18}
                  />
                }
                error={
                  fieldErrors.experience
                }
                disabled={saving}
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
                placeholder="e.g. B.Tech Computer Science"
                icon={
                  <GraduationCap
                    size={18}
                  />
                }
                error={
                  fieldErrors.education
                }
                disabled={saving}
                onChange={(value) =>
                  updateField(
                    "education",
                    value
                  )
                }
              />

            </div>

            {/* =================================================================
                BIO
                ================================================================= */}

            <div className="mt-6">

              <label
                htmlFor="bio"
                className="text-sm font-medium text-slate-300"
              >
                Mentor Bio
              </label>

              <div className="relative mt-2">

                <FileTextIcon />

                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={(event) =>
                    updateField(
                      "bio",
                      event.target.value
                    )
                  }
                  disabled={saving}
                  rows={7}
                  maxLength={3000}
                  placeholder="Describe your professional background and how you help students..."
                  className={`w-full resize-none rounded-xl border ${
                    fieldErrors.bio
                      ? "border-red-500"
                      : "border-slate-700"
                  } bg-slate-950 py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60`}
                />

              </div>

              <div className="mt-1 flex justify-between">

                <p className="text-xs text-red-400">
                  {fieldErrors.bio}
                </p>

                <p className="text-xs text-slate-500">
                  {form.bio.length}/3000
                </p>

              </div>

            </div>

            {/* =================================================================
                SKILLS
                ================================================================= */}

            <div className="mt-6">

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
                  disabled={saving}
                  rows={4}
                  maxLength={1000}
                  placeholder="Java, Spring Boot, AWS, Docker, Kubernetes, React"
                  className={`w-full resize-none rounded-xl border ${
                    fieldErrors.skills
                      ? "border-red-500"
                      : "border-slate-700"
                  } bg-slate-950 py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60`}
                />

              </div>

              {fieldErrors.skills && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.skills}
                </p>
              )}

            </div>

            {/* =================================================================
                LINKEDIN + PRICE
                ================================================================= */}

            <div className="mt-6 grid gap-6 sm:grid-cols-2">

              <InputField
                id="linkedin"
                label="LinkedIn Profile"
                value={form.linkedin}
                placeholder="https://linkedin.com/in/..."
                icon={
                  <Briefcase
                    size={18}
                  />
                }
                error={
                  fieldErrors.linkedin
                }
                disabled={saving}
                onChange={(value) =>
                  updateField(
                    "linkedin",
                    value
                  )
                }
              />

              <div>

                <label
                  htmlFor="price"
                  className="text-sm font-medium text-slate-300"
                >
                  Session Price
                </label>

                <div className="relative mt-2">

                  <IndianRupee
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

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
                    disabled={saving}
                    className={`w-full rounded-xl border ${
                      fieldErrors.price
                        ? "border-red-500"
                        : "border-slate-700"
                    } bg-slate-950 py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60`}
                  />

                </div>

                {fieldErrors.price && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.price}
                  </p>
                )}

                {!fieldErrors.price && (
                  <p className="mt-1 text-xs text-slate-500">
                    Enter 0 for free mentoring.
                  </p>
                )}

              </div>

            </div>

            {/* =================================================================
                BOTTOM SAVE
                ================================================================= */}

            <div className="mt-8 flex justify-end border-t border-slate-800 pt-6">

              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      size={17}
                    />

                    Save Changes
                  </>
                )}

              </button>

            </div>

          </section>

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
  onChange: (
    value: string
  ) => void;
}

function InputField({
  id,
  label,
  value,
  placeholder,
  icon,
  error,
  disabled,
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
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className={`w-full rounded-xl border ${
            error
              ? "border-red-500"
              : "border-slate-700"
          } bg-slate-950 py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60`}
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
   FILE TEXT ICON
   ============================================================================ */

function FileTextIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="absolute left-3 top-3 text-slate-500"
      aria-hidden="true"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}

/* ============================================================================
   STATUS ROW
   ============================================================================ */

interface StatusRowProps {
  label: string;
  value: string;
  active?: boolean;
  icon?: React.ReactNode;
}

function StatusRow({
  label,
  value,
  active = false,
  icon,
}: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span
        className={`inline-flex items-center gap-1.5 text-sm font-medium ${
          active
            ? "text-emerald-400"
            : "text-amber-400"
        }`}
      >
        {icon}

        {value}
      </span>

    </div>
  );
}