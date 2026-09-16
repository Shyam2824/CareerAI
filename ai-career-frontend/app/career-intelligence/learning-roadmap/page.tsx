"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import api from "@/services/api";

interface Topic {
  title: string;
  description?: string;
  duration?: string;
  completed?: boolean;
}

interface RoadmapPhase {
  phase: number;
  title: string;
  description?: string;
  topics: Topic[];
  duration?: string;
}

interface LearningRoadmap {
  id: number;
  user_id: number;
  target_role: string;
  current_role?: string | null;
  readiness_score: number;
  estimated_months: number;
  roadmap?: string | null;
  current_phase: number;
  completed_topics?: string | null;
  overall_progress: number;
  recommendations?: string | null;
  created_at: string;
  updated_at: string;
}

function parseRoadmap(value?: string | null): RoadmapPhase[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: unknown, index: number) => {
      const phase = item as {
        phase?: unknown;
        title?: unknown;
        description?: unknown;
        duration?: unknown;
        topics?: unknown;
      };

      const topics: Topic[] = Array.isArray(phase.topics)
        ? phase.topics.map((topic: unknown) => {
            const t = topic as {
              title?: unknown;
              description?: unknown;
              duration?: unknown;
              completed?: unknown;
            };

            return {
              title:
                typeof t.title === "string" ? t.title : "Learning Topic",
              description:
                typeof t.description === "string"
                  ? t.description
                  : undefined,
              duration:
                typeof t.duration === "string" ? t.duration : undefined,
              completed:
                typeof t.completed === "boolean" ? t.completed : false,
            };
          })
        : [];

      return {
        phase:
          typeof phase.phase === "number" ? phase.phase : index + 1,
        title:
          typeof phase.title === "string"
            ? phase.title
            : `Phase ${index + 1}`,
        description:
          typeof phase.description === "string"
            ? phase.description
            : undefined,
        duration:
          typeof phase.duration === "string"
            ? phase.duration
            : undefined,
        topics,
      };
    });
  } catch {
    return [];
  }
}

function parseStringArray(value?: string | null): string[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string => typeof item === "string"
      );
    }
  } catch {
    return [];
  }

  return [];
}

export default function LearningRoadmapPage() {
  const router = useRouter();

  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<LearningRoadmap>(
        "/learning-roadmap/my"
      );

      setRoadmap(response.data);

      const completed = parseStringArray(
        response.data.completed_topics
      );

      setCompletedTopics(completed);
      setSelectedPhase(response.data.current_phase || 1);
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
          : "No learning roadmap found. Generate your personalized roadmap.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRoadmap();
  }, []);

  const generateRoadmap = async (event?: FormEvent) => {
    event?.preventDefault();

    try {
      setGenerating(true);
      setError("");
      setSuccess("");

      const response = await api.post<LearningRoadmap>(
        "/learning-roadmap/generate"
      );

      setRoadmap(response.data);

      setCompletedTopics(
        parseStringArray(response.data.completed_topics)
      );

      setSelectedPhase(response.data.current_phase || 1);

      setSuccess("Your personalized learning roadmap is ready.");

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
          : "Unable to generate roadmap.";

      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const toggleTopic = (topicTitle: string) => {
    setCompletedTopics((current) =>
      current.includes(topicTitle)
        ? current.filter((item) => item !== topicTitle)
        : [...current, topicTitle]
    );
  };

  const saveProgress = async () => {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await api.patch<LearningRoadmap>(
        "/learning-roadmap/progress",
        {
          completed_topics: completedTopics,
          current_phase: selectedPhase,
        }
      );

      setRoadmap(response.data);

      setCompletedTopics(
        parseStringArray(response.data.completed_topics)
      );

      setSuccess("Learning progress updated successfully.");

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
          : "Unable to update progress.";

      setError(message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading learning roadmap...</span>
        </div>
      </div>
    );
  }

  const phases = parseRoadmap(roadmap?.roadmap);

  const progress = Math.min(
    100,
    Math.max(0, roadmap?.overall_progress ?? 0)
  );

  const readiness = Math.min(
    100,
    Math.max(0, roadmap?.readiness_score ?? 0)
  );

  const currentPhase =
    phases.find((phase) => phase.phase === selectedPhase) ||
    phases[0];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* BACK NAVIGATION */}
        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/career-intelligence")
          }
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          ← Back to Career Intelligence
        </button>

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-xl bg-indigo-500/10 p-2">
                <BookOpen className="h-6 w-6 text-indigo-400" />
              </div>

              <span className="text-sm font-medium text-indigo-400">
                Career Intelligence
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Personalized Learning Roadmap
            </h1>

            <p className="mt-2 max-w-3xl text-slate-400">
              A personalized learning plan based on your career profile,
              target role, skills and current readiness.
            </p>
          </div>

          <button
            type="button"
            onClick={() => generateRoadmap()}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                Generate Roadmap
              </>
            )}
          </button>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {!roadmap ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <Sparkles className="mx-auto mb-5 h-12 w-12 text-indigo-400" />

            <h2 className="text-2xl font-bold">
              Create Your Learning Roadmap
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Generate a personalized roadmap based on your target career,
              current skills, skill gaps and career readiness.
            </p>

            <button
              type="button"
              onClick={() => generateRoadmap()}
              disabled={generating}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}

              Generate My Roadmap
            </button>
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Target Role
                    </p>

                    <h3 className="mt-2 text-lg font-bold">
                      {roadmap.target_role}
                    </h3>
                  </div>

                  <Target className="h-7 w-7 text-indigo-400" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Career Readiness
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                      {readiness.toFixed(0)}%
                    </h3>
                  </div>

                  <TrendingUp className="h-7 w-7 text-emerald-400" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Duration
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                      {roadmap.estimated_months} months
                    </h3>
                  </div>

                  <Clock className="h-7 w-7 text-amber-400" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Overall Progress
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                      {progress.toFixed(0)}%
                    </h3>
                  </div>

                  <CheckCircle className="h-7 w-7 text-cyan-400" />
                </div>
              </div>
            </div>

            {/* PROGRESS */}
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Learning Progress
                  </h2>

                  <p className="text-sm text-slate-400">
                    Phase {roadmap.current_phase} of{" "}
                    {phases.length || 1}
                  </p>
                </div>

                <span className="font-bold text-indigo-400">
                  {progress.toFixed(0)}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* ROADMAP */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">

              {/* PHASE SIDEBAR */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <h2 className="mb-4 px-2 text-lg font-bold">
                  Roadmap Phases
                </h2>

                <div className="space-y-2">
                  {phases.map((phase) => (
                    <button
                      key={phase.phase}
                      type="button"
                      onClick={() => setSelectedPhase(phase.phase)}
                      className={`w-full rounded-xl p-4 text-left transition ${
                        selectedPhase === phase.phase
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                          Phase {phase.phase}
                        </span>

                        {phase.duration && (
                          <span className="text-xs opacity-70">
                            {phase.duration}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 font-semibold">
                        {phase.title}
                      </p>

                      <p className="mt-1 text-xs opacity-70">
                        {phase.topics.length} topics
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* CURRENT PHASE */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                {currentPhase ? (
                  <>
                    <div className="mb-6">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-400">
                        <Sparkles className="h-4 w-4" />
                        Phase {currentPhase.phase}
                      </div>

                      <h2 className="text-2xl font-bold">
                        {currentPhase.title}
                      </h2>

                      {currentPhase.description && (
                        <p className="mt-2 text-slate-400">
                          {currentPhase.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {currentPhase.topics.map((topic, index) => {
                        const isCompleted =
                          completedTopics.includes(topic.title);

                        return (
                          <button
                            key={`${topic.title}-${index}`}
                            type="button"
                            onClick={() =>
                              toggleTopic(topic.title)
                            }
                            className={`w-full rounded-xl border p-4 text-left transition ${
                              isCompleted
                                ? "border-emerald-500/30 bg-emerald-500/10"
                                : "border-slate-800 bg-slate-950 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                  isCompleted
                                    ? "border-emerald-400 bg-emerald-500 text-white"
                                    : "border-slate-600"
                                }`}
                              >
                                {isCompleted && (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <h3
                                    className={`font-semibold ${
                                      isCompleted
                                        ? "text-emerald-300 line-through"
                                        : "text-white"
                                    }`}
                                  >
                                    {topic.title}
                                  </h3>

                                  {topic.duration && (
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                      <Clock className="h-3.5 w-3.5" />
                                      {topic.duration}
                                    </span>
                                  )}
                                </div>

                                {topic.description && (
                                  <p className="mt-1 text-sm text-slate-400">
                                    {topic.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={saveProgress}
                        disabled={updating}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updating ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Save Progress
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    No roadmap phases available.
                  </div>
                )}
              </div>
            </div>

            {/* RECOMMENDATIONS */}
            {roadmap.recommendations && (
              <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />

                  <h2 className="text-lg font-bold">
                    AI Recommendations
                  </h2>
                </div>

                <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
                  {roadmap.recommendations}
                </p>
              </div>
            )}

            {/* CAREER INTELLIGENCE NAVIGATION */}
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold">
                  Continue Career Intelligence
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Explore your complete career intelligence tools.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/career-intelligence/skill-gap"
                    )
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-indigo-500/50 hover:bg-slate-800"
                >
                  <Target className="mb-3 h-5 w-5 text-indigo-400" />

                  <p className="font-semibold">
                    Skill Gap
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Identify missing skills
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/career-intelligence/career-path"
                    )
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-indigo-500/50 hover:bg-slate-800"
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
                      "/dashboard/career-intelligence/career-chat"
                    )
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-indigo-500/50 hover:bg-slate-800"
                >
                  <Sparkles className="mb-3 h-5 w-5 text-purple-400" />

                  <p className="font-semibold">
                    AI Career Chat
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Ask career questions
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/career-intelligence"
                    )
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-indigo-500/50 hover:bg-slate-800"
                >
                  <BookOpen className="mb-3 h-5 w-5 text-cyan-400" />

                  <p className="font-semibold">
                    Career Intelligence
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Back to main dashboard
                  </p>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}