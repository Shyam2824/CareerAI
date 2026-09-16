"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import api from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Resume {
  id: number;
  file_name: string;
}

interface CoverLetter {
  id: number;
  resume_id?: number | null;
  job_title?: string | null;
  company_name?: string | null;
  job_description?: string | null;
  tone: string;
  content: string;
  created_at: string;
  updated_at?: string | null;
}

export default function CoverLetterPage() {
  const router = useRouter();

  // ==========================================
  // STATE
  // ==========================================

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");

  const [coverLetter, setCoverLetter] =
    useState<CoverLetter | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD RESUMES
  // ==========================================

  const loadResumes = async () => {
    try {
      setLoadingResumes(true);
      setError("");

      const response = await api.get("/resumes/");

      setResumes(response.data);
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Unable to load resumes."
        );
      } else {
        setError("Unable to load resumes.");
      }
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadResumes();
  }, []);

  // ==========================================
  // GENERATE COVER LETTER
  // ==========================================

  const generateCoverLetter = async () => {
    setError("");

    if (!resumeId && !jobDescription.trim()) {
      setError(
        "Please select a resume or enter a job description."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/cover-letter/generate",
        {
          resume_id: resumeId
            ? Number(resumeId)
            : null,

          job_title:
            jobTitle.trim() || null,

          company_name:
            companyName.trim() || null,

          job_description:
            jobDescription.trim() || null,

          tone,
        }
      );

      setCoverLetter(response.data);
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Failed to generate cover letter."
        );
      } else {
        setError(
          "Failed to generate cover letter."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE COVER LETTER
  // ==========================================

  const updateContent = async () => {
    if (!coverLetter) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.put(
        `/cover-letter/${coverLetter.id}`,
        {
          content: coverLetter.content,
        }
      );

      setCoverLetter(response.data);
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Failed to save changes."
        );
      } else {
        setError(
          "Failed to save changes."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // COPY COVER LETTER
  // ==========================================

  const copyCoverLetter = async () => {
    if (!coverLetter) return;

    try {
      await navigator.clipboard.writeText(
        coverLetter.content
      );
    } catch (err: unknown) {
      console.error(err);
      setError("Unable to copy cover letter.");
    }
  };

  // ==========================================
  // CREATE NEW
  // ==========================================

  const createNew = () => {
    setCoverLetter(null);
    setResumeId("");
    setJobTitle("");
    setCompanyName("");
    setJobDescription("");
    setTone("professional");
    setError("");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">

          {/* ==================================
              HEADER
          ================================== */}

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Cover Letter Generator
              </h1>

              <p className="mt-2 text-slate-600">
                Create a personalized, job-specific cover
                letter using your resume and job description.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/cover-letter/history")
              }
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
            >
              View History
            </button>
          </div>

          {/* ==================================
              ERROR
          ================================== */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* ==================================
              MAIN GRID
          ================================== */}

          <div className="grid gap-8 lg:grid-cols-2">

            {/* ==================================
                LEFT: INPUT
            ================================== */}

            <section className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="mb-6 text-xl font-semibold text-slate-900">
                Job Information
              </h2>

              {/* Resume */}

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Select Resume
              </label>

              <select
                value={resumeId}
                onChange={(e) =>
                  setResumeId(e.target.value)
                }
                disabled={loadingResumes}
                className="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">
                  {loadingResumes
                    ? "Loading resumes..."
                    : "Select a resume"}
                </option>

                {resumes.map((resume) => (
                  <option
                    key={resume.id}
                    value={resume.id}
                  >
                    {resume.file_name}
                  </option>
                ))}
              </select>

              {/* Job Title */}

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Job Title
              </label>

              <input
                type="text"
                value={jobTitle}
                onChange={(e) =>
                  setJobTitle(e.target.value)
                }
                placeholder="e.g. Data Scientist"
                className="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* Company */}

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Company Name
              </label>

              <input
                type="text"
                value={companyName}
                onChange={(e) =>
                  setCompanyName(e.target.value)
                }
                placeholder="e.g. ABC Technologies"
                className="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* Tone */}

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tone
              </label>

              <select
                value={tone}
                onChange={(e) =>
                  setTone(e.target.value)
                }
                className="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="professional">
                  Professional
                </option>

                <option value="friendly">
                  Friendly
                </option>

                <option value="confident">
                  Confident
                </option>
              </select>

              {/* Job Description */}

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Job Description
              </label>

              <textarea
                value={jobDescription}
                onChange={(e) =>
                  setJobDescription(e.target.value)
                }
                rows={10}
                placeholder="Paste the job description here..."
                className="mb-6 w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {/* Generate */}

              <button
                type="button"
                onClick={generateCoverLetter}
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Generating..."
                  : "Generate Cover Letter"}
              </button>
            </section>

            {/* ==================================
                RIGHT: RESULT
            ================================== */}

            <section className="rounded-2xl bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <h2 className="text-xl font-semibold text-slate-900">
                  Your Cover Letter
                </h2>

                {coverLetter && (
                  <button
                    type="button"
                    onClick={copyCoverLetter}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
                  >
                    Copy
                  </button>
                )}
              </div>

              {/* Empty State */}

              {!coverLetter ? (
                <div className="flex min-h-125 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-center text-slate-500">

                  <div>

                    <div className="mb-3 text-5xl">
                      ✉️
                    </div>

                    <p className="font-medium">
                      Your cover letter will appear here.
                    </p>

                    <p className="mt-2 text-sm">
                      Select your resume and enter the job
                      information to get started.
                    </p>

                  </div>
                </div>
              ) : (
                <>
                  {/* Cover Letter Editor */}

                  <textarea
                    value={coverLetter.content}
                    onChange={(e) =>
                      setCoverLetter({
                        ...coverLetter,
                        content: e.target.value,
                      })
                    }
                    className="min-h-125 w-full resize-y rounded-xl border border-slate-300 p-5 text-sm leading-7 text-slate-800 outline-none focus:border-blue-500"
                  />

                  {/* Buttons */}

                  <div className="mt-4 flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={updateContent}
                      disabled={loading}
                      className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {loading
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={createNew}
                      className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Create New
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                    window.open(
                    `${process.env.NEXT_PUBLIC_API_URL}/cover-letter/${coverLetter.id}/pdf`,
                    "_blank"
                    )
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
                >
                        Download PDF
                </button>

                    <button
                    type="button"
                    onClick={() =>
                    window.open(
                    `${process.env.NEXT_PUBLIC_API_URL}/cover-letter/${coverLetter.id}/docx`,
                    "_blank"
                    )
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
                >
                Download DOCX
                </button>
                                </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}