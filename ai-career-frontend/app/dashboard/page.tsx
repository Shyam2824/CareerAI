"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  FileText,
  Lightbulb,
  Mic,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import  api  from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

// ============================================================
// TYPES
// ============================================================

interface DashboardStats {
  total_resumes: number;
  latest_ats_score: number;
  best_ats_score: number;
  average_ats_score: number;
}

interface Resume {
  id: number;
  file_name: string;
  file_url: string | null;
  ats_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  feedback: string | null;
  created_at: string | null;
}

interface CareerInsight {
  title: string;
  description: string;
  priority: string;
}

interface CareerInsightsResponse {
  overall_message: string;
  insights: CareerInsight[];
}

// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    return "Unable to load dashboard data.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load dashboard data.";
}

function formatDate(date: string | null): string {
  if (!date) {
    return "Unknown date";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getScoreClass(score: number): string {
  if (score >= 80) {
    return "text-emerald-600";
  }

  if (score >= 60) {
    return "text-amber-600";
  }

  return "text-red-600";
}

// ============================================================
// DASHBOARD
// ============================================================

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [recentResumes, setRecentResumes] =
    useState<Resume[]>([]);

  const [careerInsights, setCareerInsights] =
    useState<CareerInsightsResponse | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  // ==========================================================
  // FETCH DATA
  // ==========================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        statsResult,
        recentResult,
        insightsResult,
      ] = await Promise.allSettled([
        api.get<DashboardStats>(
          "/resumes/dashboard/stats"
        ),

        api.get<Resume[]>(
          "/resumes/recent"
        ),

        api.get<CareerInsightsResponse>(
          "/resumes/career-insights"
        ),
      ]);

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.data);
      }

      if (recentResult.status === "fulfilled") {
        setRecentResumes(
          recentResult.value.data
        );
      }

      if (insightsResult.status === "fulfilled") {
        setCareerInsights(
          insightsResult.value.data
        );
      }

      const failedRequests = [
        statsResult,
        recentResult,
        insightsResult,
      ].filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length === 3) {
        setError(
          getErrorMessage(
            failedRequests[0].reason
          )
        );
      }
    } catch (err: unknown) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, []);

  // ==========================================================
  // USER
  // ==========================================================

  const firstName =
    user?.name?.trim().split(" ")[0] ||
    "there";

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-slate-500">
            Loading your career dashboard...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="max-w-7xl mx-auto">

      {/* ======================================================
          WELCOME
      ====================================================== */}

      <section className="rounded-2xl bg-slate-950 p-6 md:p-8 text-white">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>

            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
              <Sparkles size={16} />
              Career Intelligence
            </div>

            <h1 className="mt-3 text-3xl md:text-4xl font-bold">
              Welcome back,{" "}
              <span className="text-blue-400">
                {firstName}
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400 leading-6">
              Understand your resume performance,
              improve your skills, and prepare for your
              next career opportunity.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/resume")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold hover:bg-blue-500 transition"
          >
            <Plus size={19} />
            Analyze Resume
          </button>

        </div>

      </section>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">

          <div>
            <p className="font-medium text-amber-800">
              Some dashboard data could not be loaded.
            </p>

            <p className="text-sm text-amber-700 mt-1">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition"
          >
            <RefreshCw size={16} />
            Retry
          </button>

        </div>
      )}

      {/* ======================================================
          KEY METRICS
      ====================================================== */}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">

        <MetricCard
          icon={<FileText size={21} />}
          title="Resumes Analyzed"
          value={stats?.total_resumes ?? 0}
          description="Total resume analyses"
        />

        <MetricCard
          icon={<BarChart3 size={21} />}
          title="Latest ATS Score"
          value={`${Math.round(
            stats?.latest_ats_score ?? 0
          )}%`}
          description="Most recent resume"
          score={stats?.latest_ats_score}
        />

        <MetricCard
          icon={<TrendingUp size={21} />}
          title="Best ATS Score"
          value={`${Math.round(
            stats?.best_ats_score ?? 0
          )}%`}
          description="Your highest score"
          score={stats?.best_ats_score}
        />

        <MetricCard
          icon={<Target size={21} />}
          title="Average ATS"
          value={`${Number(
            stats?.average_ats_score ?? 0
          ).toFixed(1)}%`}
          description="Overall resume performance"
          score={stats?.average_ats_score}
        />

      </section>

      {/* ======================================================
          CAREER INSIGHTS
      ====================================================== */}

      <section className="mt-8">

        <div className="flex items-end justify-between mb-4">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Career Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recommendations based on your resume.
            </p>
          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Lightbulb size={21} />
            </div>

            <div>

              <h3 className="font-semibold text-slate-900">
                {careerInsights?.overall_message ||
                  "Start by analyzing your resume to receive personalized career recommendations."}
              </h3>

              {careerInsights?.insights &&
                careerInsights.insights.length > 0 && (

                  <div className="mt-5 grid gap-4 md:grid-cols-2">

                    {careerInsights.insights
                      .slice(0, 4)
                      .map((insight, index) => (

                        <div
                          key={`${insight.title}-${index}`}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <h4 className="font-semibold text-slate-800">
                              {insight.title}
                            </h4>

                            {insight.priority && (
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                {insight.priority}
                              </span>
                            )}

                          </div>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {insight.description}
                          </p>

                        </div>

                      ))}

                  </div>

                )}

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <section className="mt-8">

        <div className="mb-4">

          <h2 className="text-xl font-bold text-slate-900">
            Career Tools
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose what you want to work on next.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          <ToolCard
            icon={<FileText size={21} />}
            title="Resume Analysis"
            description="Check ATS score, skills, sections, and resume issues."
            onClick={() =>
              router.push("/resume")
            }
          />

          <ToolCard
            icon={<Briefcase size={21} />}
            title="Job Match"
            description="Compare your resume against a target job."
            onClick={() =>
              router.push("/job-match")
            }
          />

          <ToolCard
            icon={<Mic size={21} />}
            title="Interview Center"
            description="Practice technical and career interview questions."
            onClick={() =>
              router.push("/interview")
            }
          />

          <ToolCard
            icon={<Users size={21} />}
            title="Find a Mentor"
            description="Connect with experienced professionals."
            onClick={() =>
              router.push("/mentors")
            }
          />

        </div>

      </section>

      {/* ======================================================
          RECENT RESUMES
      ====================================================== */}

      <section className="mt-8 pb-8">

        <div className="flex items-end justify-between mb-4">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Recent Resumes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest resume analyses.
            </p>
          </div>

          {recentResumes.length > 0 && (
            <button
              type="button"
              onClick={() =>
                router.push("/resumes")
              }
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
              <ArrowRight size={16} />
            </button>
          )}

        </div>

        {recentResumes.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
              <FileText
                size={25}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No resume analysis yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload your resume to get your first ATS analysis.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/resume")
              }
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition"
            >
              Analyze Resume
            </button>

          </div>

        ) : (

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="divide-y divide-slate-100">

              {recentResumes
                .slice(0, 5)
                .map((resume) => {

                  const score =
                    Number(resume.ats_score) || 0;

                  return (
                    <button
                      key={resume.id}
                      type="button"
                      onClick={() =>
                        router.push(
                          `/resumes/${resume.id}`
                        )
                      }
                      className="w-full text-left p-5 hover:bg-slate-50 transition"
                    >

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* FILE */}

                        <div className="flex items-center gap-4 flex-1 min-w-0">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={20} />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-semibold text-slate-800">
                              {resume.file_name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Analyzed{" "}
                              {formatDate(
                                resume.created_at
                              )}
                            </p>

                          </div>

                        </div>

                        {/* SCORE */}

                        <div className="flex items-center gap-6">

                          <div className="text-right">

                            <p className="text-xs text-slate-400">
                              ATS Score
                            </p>

                            <p
                              className={`mt-1 text-xl font-bold ${getScoreClass(
                                score
                              )}`}
                            >
                              {Math.round(score)}%
                            </p>

                          </div>

                          <ArrowRight
                            size={18}
                            className="text-slate-400"
                          />

                        </div>

                      </div>

                    </button>
                  );
                })}

            </div>

          </div>

        )}

      </section>

    </div>
  );
}

// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({
  icon,
  title,
  value,
  description,
  score,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  score?: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-start justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        {typeof score === "number" && (
          <span
            className={`text-xs font-semibold ${getScoreClass(
              score
            )}`}
          >
            {score >= 80
              ? "Strong"
              : score >= 60
              ? "Average"
              : "Needs work"}
          </span>
        )}

      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}

// ============================================================
// TOOL CARD
// ============================================================

function ToolCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-blue-300 hover:shadow-md transition"
    >

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
          {icon}
        </div>

        <ArrowRight
          size={18}
          className="text-slate-300 group-hover:text-blue-600 transition"
        />

      </div>

      <h3 className="mt-5 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </button>
  );
}

// ============================================================
// PAGE EXPORT
// ============================================================

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}