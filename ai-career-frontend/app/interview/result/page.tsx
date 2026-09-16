"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import  api  from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";

interface QuestionResult {
  id: number;
  question: string;
  category?: string | null;
  topic?: string | null;
  score?: number | null;
  status: string;
  feedback?: string | null;
  question_order: number;
}

interface CategoryPerformance {
  category: string;
  score: number;
  questions: number;
}

interface InterviewResult {
  interview_id: number;
  job_title?: string | null;
  company_name?: string | null;
  interview_type: string;
  difficulty: string;
  total_questions: number;
  completed_questions: number;
  overall_score: number;
  status: string;
  strong_questions: number;
  weak_questions: number;
  category_performance: CategoryPerformance[];
  recommendations: string[];
  questions: QuestionResult[];
}

function InterviewResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const interviewId = searchParams.get("id");

  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      setLoading(true);
      setError("");

      // -----------------------------
      // Validate interview ID
      // -----------------------------
      if (!interviewId) {
        setError("Interview ID is missing.");
        setLoading(false);
        return;
      }

      const id = Number(interviewId);

      if (!Number.isInteger(id) || id <= 0) {
        setError(`Invalid interview ID: ${interviewId}`);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<InterviewResult>(
          `/interviews/${id}/result`
        );

        // Make sure backend returned a valid interview ID
        if (
          !response.data ||
          !Number.isInteger(response.data.interview_id) ||
          response.data.interview_id <= 0
        ) {
          setError("Invalid interview result received from server.");
          return;
        }

        setResult(response.data);
      } catch (err: unknown) {
        console.error("Failed to load interview result:", err);

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
          } else {
            setError(
              `Unable to load interview result${
                err.response?.status
                  ? ` (${err.response.status})`
                  : ""
              }.`
            );
          }
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load interview result.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [interviewId]);

  // -----------------------------
  // Loading
  // -----------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">
          Loading interview result...
        </p>
      </div>
    );
  }

  // -----------------------------
  // Error
  // -----------------------------
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <p className="text-red-700">{String(error)}</p>

          <button
            onClick={() => router.push("/interview")}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Back to Interview
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const score = result.overall_score;

  let scoreLabel = "Needs Improvement";

  if (score >= 80) {
    scoreLabel = "Excellent";
  } else if (score >= 60) {
    scoreLabel = "Good";
  } else if (score >= 40) {
    scoreLabel = "Average";
  }

  // IMPORTANT:
  // Always use the interview ID returned by backend.
  const actualInterviewId = result.interview_id;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/interview")}
            className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Interview Center
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Interview Result
          </h1>

          <p className="mt-2 text-slate-500">
            {result.job_title || "Mock Interview"}
            {result.company_name
              ? ` • ${result.company_name}`
              : ""}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Interview ID: {actualInterviewId}
          </p>
        </div>

        {/* Score */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-8 md:grid-cols-3">

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Overall Score
              </p>

              <p className="mt-2 text-6xl font-bold text-blue-600">
                {score}
              </p>

              <p className="mt-2 font-semibold text-slate-700">
                {scoreLabel}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Questions
              </p>

              <p className="mt-3 text-4xl font-bold text-slate-900">
                {result.completed_questions}
                <span className="text-xl text-slate-400">
                  /{result.total_questions}
                </span>
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Completed
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Strong Answers
              </p>

              <p className="mt-3 text-4xl font-bold text-green-600">
                {result.strong_questions}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Score ≥ 75
              </p>
            </div>

          </div>
        </section>

        {/* Category Performance */}
        {result.category_performance.length > 0 && (
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Category Performance
            </h2>

            <div className="mt-5 space-y-5">
              {result.category_performance.map((item) => (
                <div key={item.category}>
                  <div className="mb-2 flex justify-between">
                    <span className="font-medium text-slate-700">
                      {item.category}
                    </span>

                    <span className="font-semibold text-slate-900">
                      {item.score}/100
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(
                          Math.max(item.score, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Improvement Recommendations
          </h2>

          {result.recommendations.length > 0 ? (
            <div className="mt-4 space-y-3">
              {result.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-lg bg-slate-50 p-4"
                  >
                    <span className="font-bold text-blue-600">
                      {index + 1}.
                    </span>

                    <p className="text-slate-700">
                      {recommendation}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="mt-4 text-slate-500">
              No recommendations available.
            </p>
          )}
        </section>

        {/* Question Performance */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Question-wise Performance
          </h2>

          <div className="mt-5 space-y-4">
            {result.questions.map((question) => (
              <div
                key={question.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      Question {question.question_order}
                    </p>

                    <h3 className="mt-1 font-semibold text-slate-900">
                      {question.question}
                    </h3>

                    {question.category && (
                      <p className="mt-2 text-sm text-slate-500">
                        {question.category}
                        {question.topic
                          ? ` • ${question.topic}`
                          : ""}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <span className="rounded-full bg-blue-50 px-4 py-2 font-bold text-blue-700">
                      {question.score ?? 0}/100
                    </span>
                  </div>
                </div>

                {question.feedback && (
                  <div className="mt-4 rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Feedback
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {question.feedback}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4">

          {/* Practice Again */}
          <button
            onClick={() => router.push("/interview")}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Practice Again
          </button>

          {/* IMPORTANT ANALYTICS BUTTON */}
          <button
            onClick={() =>
              router.push(
                `/interview/analytics?id=${actualInterviewId}`
              )
            }
            className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
          >
            View Analytics
          </button>

          {/* Dashboard */}
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </button>

        </div>

      </div>
    </main>
  );
}

export default function InterviewResultPage() {
  return (
    <ProtectedRoute>
      <InterviewResultContent />
    </ProtectedRoute>
  );
}