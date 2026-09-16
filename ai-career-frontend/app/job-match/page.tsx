"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import  api  from "@/services/api";

interface Resume {
id: number;
file_name: string;
ats_score: number;
}

export default function JobMatchPage() {
const router = useRouter();

const [resumes, setResumes] = useState<Resume[]>([]);
const [resumeId, setResumeId] = useState<string>("");
const [jobTitle, setJobTitle] = useState<string>("");
const [companyName, setCompanyName] = useState<string>("");
const [jobDescription, setJobDescription] =
useState<string>("");

const [loadingResumes, setLoadingResumes] =
useState<boolean>(true);

const [analyzing, setAnalyzing] =
useState<boolean>(false);

const [error, setError] =
useState<string>("");

// ==========================================
// LOAD RESUMES
// ==========================================

useEffect(() => {
const fetchResumes = async () => {
try {
setLoadingResumes(true);
setError("");


    const response = await api.get<Resume[]>(
      "/resumes/"
    );

    setResumes(response.data);
  } catch (err: unknown) {
    console.error(
      "Failed to load resumes:",
      err
    );

    setError(
      "Failed to load resumes. Please try again."
    );
  } finally {
    setLoadingResumes(false);
  }
};

fetchResumes();


}, []);

// ==========================================
// ANALYZE JOB MATCH
// ==========================================

const handleAnalyze = async (
event: React.FormEvent<HTMLFormElement>
) => {
event.preventDefault();


setError("");

// Validate Resume
if (!resumeId) {
  setError("Please select a resume.");
  return;
}

// Validate Job Description
if (!jobDescription.trim()) {
  setError(
    "Please enter a job description."
  );
  return;
}

if (jobDescription.trim().length < 50) {
  setError(
    "Job description must contain at least 50 characters."
  );
  return;
}

try {
  setAnalyzing(true);

  const response = await api.post(
    "/job-match/analyze",
    {
      resume_id: Number(resumeId),
      job_title: jobTitle.trim() || null,
      company_name: companyName.trim() || null,
      job_description: jobDescription.trim(),
    }
  );

  const matchId = response.data.id;

  router.push(
    "/job-match/" + matchId
  );
} catch (err: unknown) {
  console.error(
    "Job match analysis failed:",
    err
  );

  if (axios.isAxiosError(err)) {
    setError(
      err.response?.data?.detail ||
        "Failed to analyze job match."
    );
  } else {
    setError(
      "Something went wrong. Please try again."
    );
  }
} finally {
  setAnalyzing(false);
}

};

return ( <main className="min-h-screen bg-slate-950 text-white"> <div className="mx-auto max-w-5xl px-6 py-12">

```
    {/* ========================================== */}
    {/* HEADER */}
    {/* ========================================== */}

    <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

      <div>
        <h1 className="text-4xl font-bold">
          Job Match Analysis
        </h1>

        <p className="mt-3 text-slate-400">
          Compare your resume with a job description
          and discover how well your profile matches.
        </p>
      </div>

      {/* VIEW HISTORY */}

      <Link
        href="/job-match/history"
        className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
      >
        View History
      </Link>

    </div>

    {/* ========================================== */}
    {/* FORM */}
    {/* ========================================== */}

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

      <form
        onSubmit={handleAnalyze}
        className="space-y-7"
      >

        {/* SELECT RESUME */}

        <div>
          <label className="mb-3 block text-sm font-medium">
            Select Resume
          </label>

          {loadingResumes ? (
            <p className="text-sm text-slate-400">
              Loading resumes...
            </p>
          ) : resumes.length === 0 ? (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-400">
              No resumes found. Please upload a resume first.
            </div>
          ) : (
            <select
              value={resumeId}
              onChange={(event) =>
                setResumeId(event.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">
                Select your resume
              </option>

              {resumes.map((resume) => (
                <option
                  key={resume.id}
                  value={resume.id}
                >
                  {resume.file_name} — ATS Score:{" "}
                  {Number(resume.ats_score).toFixed(1)}%
                </option>
              ))}
            </select>
          )}
        </div>

        {/* JOB TITLE + COMPANY */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <div>
            <label className="mb-3 block text-sm font-medium">
              Job Title
            </label>

            <input
              type="text"
              value={jobTitle}
              onChange={(event) =>
                setJobTitle(event.target.value)
              }
              placeholder="e.g. Machine Learning Engineer"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium">
              Company Name
            </label>

            <input
              type="text"
              value={companyName}
              onChange={(event) =>
                setCompanyName(event.target.value)
              }
              placeholder="e.g. Google"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* JOB DESCRIPTION */}

        <div>
          <div className="mb-3 flex items-center justify-between">

            <label className="text-sm font-medium">
              Job Description
            </label>

            <span className="text-xs text-slate-500">
              {jobDescription.length} characters
            </span>

          </div>

          <textarea
            value={jobDescription}
            onChange={(event) =>
              setJobDescription(event.target.value)
            }
            placeholder="Paste the complete job description here..."
            rows={14}
            className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-4 text-sm leading-relaxed text-white outline-none focus:border-blue-500"
          />

          <p className="mt-2 text-xs text-slate-500">
            For better results, paste the complete
            job description including skills,
            responsibilities and qualifications.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={
            analyzing ||
            loadingResumes ||
            resumes.length === 0
          }
          className="w-full rounded-lg bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {analyzing
            ? "Analyzing Resume..."
            : "Analyze Job Match"}
        </button>

      </form>
    </div>

    {/* ========================================== */}
    {/* INFO CARDS */}
    {/* ========================================== */}

    <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="font-semibold">
          🎯 Smart Matching
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Compare your skills directly with job requirements.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="font-semibold">
          🔍 Missing Skills
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Identify important skills missing from your resume.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="font-semibold">
          💡 Recommendations
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Get actionable recommendations to improve your match score.
        </p>
      </div>

    </div>

  </div>
</main>


);
}
