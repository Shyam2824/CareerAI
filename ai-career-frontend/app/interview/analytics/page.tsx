"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Clock,
  Mic,
  Target,
  Trophy,
  Volume2,
} from "lucide-react";
import  api  from "@/services/api";
import axios from "axios";

interface CategoryPerformance {
  category: string;
  score: number;
  questions: number;
}

interface TopicPerformance {
  topic: string;
  score: number;
  questions: number;
}

interface Analytics {
  interview_id: number;
  job_title?: string;
  company_name?: string;
  interview_type: string;
  difficulty: string;

  total_questions: number;
  completed_questions: number;
  completion_percentage: number;

  average_score: number;
  strong_answers: number;
  weak_answers: number;

  voice_answers: number;
  text_answers: number;

  total_voice_duration_seconds: number;
  average_voice_duration_seconds: number;

  category_performance: CategoryPerformance[];
  topic_performance: TopicPerformance[];

  recommendations: string[];
}

function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const interviewId = searchParams.get("id");

  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  

  useEffect(() => {
  if (!interviewId) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError("Interview ID is missing.");
    setLoading(false);
    return;
  }

  const id = parseInt(interviewId, 10);

  if (Number.isNaN(id) || id <= 0) {
    setError(`Invalid interview ID: ${interviewId}`);
    setLoading(false);
    return;
  }

  // eslint-disable-next-line react-hooks/immutability
  loadAnalytics(id);
}, [interviewId]);

  const loadAnalytics = async (id: number) => {
  try {
    setLoading(true);
    setError("");

    const response = await api.get<Analytics>(
      `/interviews/${id}/analytics`
    );

    setAnalytics(response.data);
  } catch (err: unknown) {
    console.error("Analytics error:", err);

    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(
          detail
            .map((item: unknown) => {
              if (typeof item === "string") {
                return item;
              }

              if (
                typeof item === "object" &&
                item !== null &&
                "msg" in item
              ) {
                return String(
                  (item as { msg?: unknown }).msg ??
                    "Validation error"
                );
              }

              return "Validation error";
            })
            .join(", ")
        );
      } else if (
        typeof detail === "object" &&
        detail !== null &&
        "msg" in detail
      ) {
        setError(
          String(
            (detail as { msg?: unknown }).msg ??
              "Request validation failed"
          )
        );
      } else {
        setError(
          `Request failed with status ${
            err.response?.status ?? "unknown"
          }`
        );
      }
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Failed to load interview analytics.");
    }
  } finally {
    setLoading(false);
  }
};

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0 sec";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds} sec`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Needs Improvement";
    return "Weak";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg font-semibold">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-red-600">
            {String(error || "Analytics not found.")}
          </p>

          <button
            onClick={() => router.back()}
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <h1 className="text-3xl font-bold text-slate-900">
              Interview Analytics
            </h1>

            <p className="mt-2 text-slate-600">
              {analytics.job_title || "Technical Interview"}
              {analytics.company_name
                ? ` • ${analytics.company_name}`
                : ""}
            </p>
          </div>

          <div className="rounded-xl bg-white px-5 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Difficulty
            </p>

            <p className="font-semibold capitalize text-slate-900">
              {analytics.difficulty}
            </p>
          </div>
        </div>

        {/* Main Score */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl bg-white p-8 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-3">
                <Trophy size={24} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Overall Score
                </p>

                <p className="text-4xl font-bold text-slate-900">
                  {analytics.average_score}
                  <span className="text-lg text-slate-400">
                    /100
                  </span>
                </p>
              </div>
            </div>

            <p className="mt-5 font-semibold">
              {getScoreLabel(analytics.average_score)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Completion
                </p>

                <p className="text-3xl font-bold">
                  {analytics.completion_percentage}%
                </p>
              </div>

              <CheckCircle size={30} />
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{
                  width: `${analytics.completion_percentage}%`,
                }}
              />
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {analytics.completed_questions} of{" "}
              {analytics.total_questions} questions completed
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<Target size={22} />}
            title="Strong Answers"
            value={analytics.strong_answers}
          />

          <StatCard
            icon={<BarChart3 size={22} />}
            title="Weak Answers"
            value={analytics.weak_answers}
          />

          <StatCard
            icon={<Mic size={22} />}
            title="Voice Answers"
            value={analytics.voice_answers}
          />

          <StatCard
            icon={<Clock size={22} />}
            title="Avg Voice Duration"
            value={formatDuration(
              analytics.average_voice_duration_seconds
            )}
          />
        </div>

        {/* Voice Analytics */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <Volume2 size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Voice Analytics
              </h2>

              <p className="text-sm text-slate-500">
                Your spoken-answer performance
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            <Metric
              label="Voice Answers"
              value={analytics.voice_answers}
            />

            <Metric
              label="Text Answers"
              value={analytics.text_answers}
            />

            <Metric
              label="Total Voice Time"
              value={formatDuration(
                analytics.total_voice_duration_seconds
              )}
            />
          </div>
        </section>

        {/* Category Performance */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-bold">
            Category Performance
          </h2>

          {analytics.category_performance.length === 0 ? (
            <p className="text-slate-500">
              No category performance data available yet.
            </p>
          ) : (
            <div className="space-y-5">
              {analytics.category_performance.map(
                (item) => (
                  <div key={item.category}>

                    <div className="mb-2 flex justify-between">
                      <span className="font-medium">
                        {item.category}
                      </span>

                      <span className="font-bold">
                        {item.score}/100
                      </span>
                    </div>

                    <div className="h-3 rounded-full bg-slate-200">
                      <div
                        className="h-3 rounded-full bg-slate-900"
                        style={{
                          width: `${item.score}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.questions} question
                      {item.questions !== 1 ? "s" : ""}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Topic Performance */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-bold">
            Topic Performance
          </h2>

          {analytics.topic_performance.length === 0 ? (
            <p className="text-slate-500">
              No topic performance data available yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {analytics.topic_performance.map(
                (item) => (
                  <div
                    key={item.topic}
                    className="rounded-xl border p-5"
                  >
                    <div className="flex justify-between">
                      <p className="font-semibold">
                        {item.topic}
                      </p>

                      <p className="font-bold">
                        {item.score}
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {item.questions} question
                      {item.questions !== 1 ? "s" : ""}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Recommendations */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-bold">
            Recommendations
          </h2>

          <div className="space-y-3">

            {analytics.recommendations.map(
              (recommendation, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl border p-4"
                >
                  <CheckCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="text-slate-700">
                    {recommendation}
                  </p>
                </div>
              )
            )}

          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">

          <button
            onClick={() =>
              router.push(
                `/interview?id=${analytics.interview_id}`
              )
            }
            className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Practice Again
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-100"
          >
            Dashboard
          </button>

        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-3">
          {icon}
        </div>

        <p className="text-sm text-slate-500">
          {title}
        </p>
      </div>

      <p className="text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

export default function InterviewAnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}