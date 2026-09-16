"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import api  from "@/services/api";

interface CareerReport {
  id: number;
  user_id: number;
  target_role?: string | null;
  overall_score: number;

  executive_summary?: string | null;

  career_profile?: string | null;
  resume_analysis?: string | null;
  skills_analysis?: string | null;
  skill_gap_analysis?: string | null;
  career_path?: string | null;
  learning_roadmap?: string | null;
  job_readiness?: string | null;

  strengths?: string | null;
  areas_to_improve?: string | null;

  short_term_goals?: string | null;
  long_term_goals?: string | null;

  recommendations?: string | null;

  created_at: string;
  updated_at: string;
}

function parseArray(value?: string | null): string[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is string =>
        typeof item === "string"
    );
  } catch {
    return [];
  }
}

function parseObject(
  value?: string | null
): Record<string, unknown> {
  if (!value) return {};

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch {
    return {};
  }
}

export default function CareerReportPage() {
  const router = useRouter();

  const [report, setReport] =
    useState<CareerReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<CareerReport>(
          "/career-report/my"
        );

      setReport(response.data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReport();
  }, []);

  const generateReport = async () => {
    try {
      setGenerating(true);
      setError("");
      setSuccess("");

      const response =
        await api.post<CareerReport>(
          "/career-report/generate"
        );

      setReport(response.data);

      setSuccess(
        "Your AI Career Report has been generated successfully."
      );

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
          : "Unable to generate career report.";

      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading Career Report...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-4xl">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/career-intelligence"
              )
            }
            className="mb-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Career Intelligence
          </button>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

            <Sparkles className="mx-auto mb-5 h-14 w-14 text-indigo-400" />

            <h1 className="text-3xl font-bold">
              AI Career Report
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Generate a complete career report combining your
              resume, skills, career path, skill gaps,
              learning roadmap and Career Score.
            </p>

            <button
              type="button"
              onClick={generateReport}
              disabled={generating}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}

              Generate AI Career Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  const strengths = parseArray(report.strengths);
  const improvements = parseArray(
    report.areas_to_improve
  );
  const shortTermGoals = parseArray(
    report.short_term_goals
  );
  const longTermGoals = parseArray(
    report.long_term_goals
  );
  const recommendations = parseArray(
    report.recommendations
  );

  const careerProfile = parseObject(
    report.career_profile
  );

  const resumeData = parseObject(
    report.resume_analysis
  );

  const skillGap = parseObject(
    report.skill_gap_analysis
  );

  const missingSkills = Array.isArray(
    skillGap.missing_skills
  )
    ? skillGap.missing_skills.filter(
        (item): item is string =>
          typeof item === "string"
      )
    : [];

  const score = Math.round(
    Math.max(
      0,
      Math.min(100, report.overall_score)
    )
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/career-intelligence"
              )
            }
            className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Career Intelligence
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-xl bg-indigo-500/10 p-2">
                  <Sparkles className="h-6 w-6 text-indigo-400" />
                </div>

                <span className="text-sm font-medium text-indigo-400">
                  Career Intelligence
                </span>
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                AI Career Report
              </h1>

              <p className="mt-2 text-slate-400">
                Your complete career intelligence report
                for{" "}
                <span className="font-semibold text-white">
                  {report.target_role}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={generateReport}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}

              Regenerate Report
            </button>

          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
            {success}
          </div>
        )}

        {/* SCORE HERO */}

        <div className="mb-6 rounded-2xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/10 to-slate-900 p-6">

          <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">

            <div className="flex justify-center">

              <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-14 border-indigo-500/20">

                <div
                  className="absolute -inset-3.5 rounded-full border-14 border-transparent border-t-indigo-500 border-r-indigo-500"
                  style={{
                    transform: `rotate(${score * 1.8}deg)`,
                  }}
                />

                <div className="text-center">
                  <div className="text-5xl font-bold">
                    {score}
                  </div>

                  <div className="text-sm text-slate-400">
                    Career Score
                  </div>
                </div>

              </div>
            </div>

            <div>

              <div className="mb-2 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />

                <span className="font-semibold text-amber-300">
                  Overall Career Readiness
                </span>
              </div>

              <h2 className="text-2xl font-bold">
                {report.target_role}
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-slate-300">
                {report.executive_summary}
              </p>

            </div>

          </div>
        </div>

        {/* PROFILE + RESUME */}

        <div className="grid gap-6 lg:grid-cols-2">

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5 flex items-center gap-3">
              <Target className="h-6 w-6 text-indigo-400" />

              <h2 className="text-xl font-bold">
                Career Profile
              </h2>
            </div>

            <div className="space-y-4">

              <div>
                <p className="text-xs uppercase text-slate-500">
                  Current Role
                </p>

                <p className="mt-1 font-medium">
                  {String(
                    careerProfile.current_role ||
                      "Not specified"
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-500">
                  Target Role
                </p>

                <p className="mt-1 font-medium">
                  {String(
                    careerProfile.target_role ||
                      report.target_role
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-500">
                  Experience
                </p>

                <p className="mt-1 font-medium">
                  {careerProfile.years_of_experience != null
                    ? `${String(
                        careerProfile.years_of_experience
                      )} years`
                    : "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-500">
                  Education
                </p>

                <p className="mt-1 font-medium">
                  {String(
                    careerProfile.education ||
                      "Not specified"
                  )}
                </p>
              </div>

            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5 flex items-center gap-3">
              <FileText className="h-6 w-6 text-cyan-400" />

              <h2 className="text-xl font-bold">
                Resume Analysis
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  ATS Score
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {String(
                    resumeData.ats_score ?? 0
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Skills Score
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {String(
                    resumeData.skills_score ?? 0
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Experience Score
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {String(
                    resumeData.experience_score ?? 0
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Education Score
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {String(
                    resumeData.education_score ?? 0
                  )}
                </p>
              </div>

            </div>
          </section>

        </div>

        {/* STRENGTHS / IMPROVEMENTS */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">

            <div className="mb-5 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-400" />

              <h2 className="text-xl font-bold">
                Your Strengths
              </h2>
            </div>

            <div className="space-y-3">
              {strengths.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex gap-3"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                  <p className="text-sm leading-6 text-slate-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>

          </section>

          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">

            <div className="mb-5 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-amber-400" />

              <h2 className="text-xl font-bold">
                Areas to Improve
              </h2>
            </div>

            <div className="space-y-3">
              {improvements.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex gap-3"
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-400" />

                  <p className="text-sm leading-6 text-slate-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>

          </section>

        </div>

        {/* SKILL GAP */}

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-5 flex items-center justify-between">

            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-red-400" />

              <h2 className="text-xl font-bold">
                Skill Gap Analysis
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/career-intelligence/skill-gap"
                )
              }
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              View Details →
            </button>

          </div>

          {missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">
              No major missing skills were identified.
            </p>
          )}

        </section>

        {/* JOB READINESS */}

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-4 flex items-center gap-3">
            <Award className="h-6 w-6 text-purple-400" />

            <h2 className="text-xl font-bold">
              Job Readiness
            </h2>
          </div>

          <p className="leading-7 text-slate-300">
            {report.job_readiness}
          </p>

        </section>

        {/* GOALS */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-5 text-xl font-bold">
              Short-Term Goals
            </h2>

            <div className="space-y-4">
              {shortTermGoals.map(
                (goal, index) => (
                  <div
                    key={`${goal}-${index}`}
                    className="flex gap-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-400">
                      {index + 1}
                    </span>

                    <p className="text-sm leading-6 text-slate-300">
                      {goal}
                    </p>
                  </div>
                )
              )}
            </div>

          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-5 text-xl font-bold">
              Long-Term Goals
            </h2>

            <div className="space-y-4">
              {longTermGoals.map(
                (goal, index) => (
                  <div
                    key={`${goal}-${index}`}
                    className="flex gap-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400">
                      {index + 1}
                    </span>

                    <p className="text-sm leading-6 text-slate-300">
                      {goal}
                    </p>
                  </div>
                )
              )}
            </div>

          </section>

        </div>

        {/* AI RECOMMENDATIONS */}

        <section className="mt-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">

          <div className="mb-5 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-indigo-400" />

            <h2 className="text-xl font-bold">
              AI Career Recommendations
            </h2>
          </div>

          <div className="space-y-4">

            {recommendations.map(
              (recommendation, index) => (
                <div
                  key={`${recommendation}-${index}`}
                  className="flex gap-3"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />

                  <p className="text-sm leading-6 text-slate-300">
                    {recommendation}
                  </p>
                </div>
              )
            )}

          </div>

        </section>

        {/* QUICK ACTIONS */}

        <section className="mt-8">

          <h2 className="mb-4 text-xl font-bold">
            Continue Your Career Journey
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/career-intelligence/skill-gap"
                )
              }
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-indigo-500/50"
            >
              <Target className="mb-3 h-5 w-5 text-indigo-400" />

              <p className="font-semibold">
                Skill Gap
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Improve missing skills
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/career-intelligence/career-path"
                )
              }
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-indigo-500/50"
            >
              <TrendingUp className="mb-3 h-5 w-5 text-emerald-400" />

              <p className="font-semibold">
                Career Path
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Explore your career path
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/career-intelligence/learning-roadmap"
                )
              }
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-indigo-500/50"
            >
              <BookOpen className="mb-3 h-5 w-5 text-cyan-400" />

              <p className="font-semibold">
                Learning Roadmap
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Continue learning
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/career-intelligence/career-chat"
                )
              }
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-indigo-500/50"
            >
              <Sparkles className="mb-3 h-5 w-5 text-purple-400" />

              <p className="font-semibold">
                AI Career Chat
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Ask career questions
              </p>
            </button>

          </div>

        </section>

        <div className="mt-10 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
          Report generated on{" "}
          {new Date(
            report.updated_at
          ).toLocaleString()}
        </div>

      </div>
    </div>
  );
}