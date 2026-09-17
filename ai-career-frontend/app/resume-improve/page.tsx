"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import axios from "axios";

interface Resume {
  id: number;
  file_name: string;
  ats_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
}

interface Improvement {
  id: number;
  section: string;
  original: string;
  improved: string | null;
  issue: string;
  impact: string;
}

interface Analysis {
  id: number;
  resume_id: number;
  overall_score: number;

  current_scores: {
    ats_score: number;
    skills_score: number;
    experience_score: number;
    education_score: number;
  };

  summary: {
    recommendations: string[];
  };

  improvements: Improvement[];

  keyword_suggestions: string[];

  formatting_recommendations: string[];

  ats_recommendations: string[];

  total_improvements: number;

  created_at: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://careerai-5-mn6f.onrender.com";

export default function ResumeImprovePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState<string>("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingResumes, setLoadingResumes] =
    useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoadingResumes(true);
      setError("");

      const response = await axios.get<Resume[]>(
        `${API_URL}/resumes/`
      );

      setResumes(response.data);

      if (response.data.length > 0) {
        setResumeId(String(response.data[0].id));
      }
    } catch (err: unknown) {
      console.error("Failed to load resumes:", err);
      setError("Failed to load your resumes.");
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleAnalyze = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!resumeId) {
      setError("Please select a resume.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysis(null);

      const response = await axios.post<Analysis>(
        `${API_URL}/resume-improvement/${resumeId}`
      );

      setAnalysis(response.data);
    } catch (err: unknown) {
      console.error(
        "Resume improvement failed:",
        err
      );

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Failed to analyze resume improvements."
        );
      } else {
        setError(
          "Failed to analyze resume improvements."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score: number): string => {
    if (score >= 85) {
      return "text-emerald-400";
    }

    if (score >= 70) {
      return "text-yellow-400";
    }

    return "text-red-400";
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              AI Resume Improvement
            </h1>

            <p className="mt-3 text-slate-400">
              Improve your resume for ATS systems,
              recruiters, and your target roles.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Resume Selector */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
          <h2 className="text-xl font-bold">
            Select Resume
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Select a resume to generate improvement
            recommendations.
          </p>

          <form
            onSubmit={handleAnalyze}
            className="mt-6 flex flex-col gap-4 md:flex-row"
          >
            <select
              value={resumeId}
              onChange={(event) =>
                setResumeId(event.target.value)
              }
              disabled={loadingResumes || loading}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              {resumes.length === 0 ? (
                <option value="">
                  {loadingResumes
                    ? "Loading resumes..."
                    : "No resumes available"}
                </option>
              ) : (
                resumes.map((resume) => (
                  <option
                    key={resume.id}
                    value={String(resume.id)}
                  >
                    {resume.file_name}
                  </option>
                ))
              )}
            </select>

            <button
              type="submit"
              disabled={
                loading ||
                loadingResumes ||
                !resumeId
              }
              className="rounded-lg bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analyzing..."
                : "Improve Resume"}
            </button>
          </form>

          {error && (
            <div className="mt-5 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
              {error}
            </div>
          )}
        </section>

        {/* Results */}
        {analysis && (
          <div className="mt-10 space-y-8">

            {/* Scores */}
            <section className="grid gap-5 md:grid-cols-5">

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Improvement Score
                </p>

                <p
                  className={`mt-3 text-4xl font-bold ${getScoreClass(
                    analysis.overall_score
                  )}`}
                >
                  {analysis.overall_score.toFixed(1)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Overall resume quality
                </p>
              </div>

              {[
                {
                  label: "ATS",
                  score: analysis.current_scores.ats_score,
                },
                {
                  label: "Skills",
                  score: analysis.current_scores.skills_score,
                },
                {
                  label: "Experience",
                  score:
                    analysis.current_scores.experience_score,
                },
                {
                  label: "Education",
                  score:
                    analysis.current_scores.education_score,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <p className="text-sm text-slate-400">
                    {item.label}
                  </p>

                  <p
                    className={`mt-3 text-3xl font-bold ${getScoreClass(
                      item.score
                    )}`}
                  >
                    {item.score.toFixed(1)}
                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width:
                          Math.min(
                            Math.max(item.score, 0),
                            100
                          ) + "%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* Summary */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <h2 className="text-xl font-bold">
                Professional Summary
              </h2>

              <div className="mt-5 space-y-3">
                {analysis.summary.recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300"
                    >
                      {recommendation}
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Experience Improvements */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <h2 className="text-xl font-bold">
                Experience Improvements
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {analysis.total_improvements} improvement
                {analysis.total_improvements !== 1
                  ? "s"
                  : ""}{" "}
                detected.
              </p>

              {analysis.improvements.length === 0 ? (
                <div className="mt-6 rounded-lg bg-emerald-950/30 p-5 text-emerald-300">
                  Your experience bullets are already
                  well structured.
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {analysis.improvements.map(
                    (item, index) => (
                      <div
                        key={`${item.section}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className="rounded-full bg-blue-950 px-3 py-1 text-xs font-medium text-blue-300">
                            {item.section}
                          </span>

                          <span className="text-xs uppercase text-red-400">
                            {item.impact} impact
                          </span>
                        </div>

                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Current
                        </p>

                        <p className="mt-2 text-sm text-slate-300">
                          {item.original}
                        </p>

                        <div className="my-5 h-px bg-slate-800" />

                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Issue
                        </p>

                        <p className="mt-2 text-sm text-yellow-300">
                          {item.issue}
                        </p>

                        {item.improved && (
                          <>
                            <div className="my-5 h-px bg-slate-800" />

                            <p className="text-xs font-semibold uppercase text-slate-500">
                              Suggested Version
                            </p>

                            <p className="mt-2 text-sm text-emerald-300">
                              {item.improved}
                            </p>
                          </>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            {/* Keywords */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <h2 className="text-xl font-bold">
                Recommended Keywords
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Skills detected from your resume that can
                be emphasized where relevant.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {analysis.keyword_suggestions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No keyword suggestions available.
                  </p>
                ) : (
                  analysis.keyword_suggestions.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300"
                      >
                        {skill}
                      </span>
                    )
                  )
                )}
              </div>
            </section>

            {/* ATS Recommendations */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <h2 className="text-xl font-bold">
                ATS Recommendations
              </h2>

              <div className="mt-5 space-y-3">
                {analysis.ats_recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4"
                    >
                      <span className="text-blue-400">
                        ✓
                      </span>

                      <p className="text-sm text-slate-300">
                        {recommendation}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Formatting */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <h2 className="text-xl font-bold">
                Formatting Recommendations
              </h2>

              <div className="mt-5 space-y-3">
                {analysis.formatting_recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4"
                    >
                      <span className="text-purple-400">
                        ✓
                      </span>

                      <p className="text-sm text-slate-300">
                        {recommendation}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <section className="mt-10 rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-2xl font-bold">
              Ready to improve your resume?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Select a resume above and click
              <span className="font-medium text-white">
                {" "}
                Improve Resume
              </span>{" "}
              to receive ATS, experience, keyword, and
              formatting recommendations.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}