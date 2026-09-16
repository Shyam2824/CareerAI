"use client";

import {
  ArrowLeft,
  Brain,
  CheckCircle,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import  api  from "@/services/api";


interface CareerScore {
  id: number;
  user_id: number;

  overall_score: number;

  resume_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  skill_gap_score: number;
  learning_progress_score: number;

  status: string;

  recommendations?: string | null;
}


interface ScoreItemProps {
  label: string;
  score: number;
}


function ScoreItem({
  label,
  score,
}: ScoreItemProps) {

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm text-slate-400">
          {label}
        </span>

        <span className="font-semibold text-white">
          {Math.round(score)}%
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">

        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700"
          style={{
            width: `${Math.min(
              Math.max(score, 0),
              100
            )}%`,
          }}
        />

      </div>

    </div>
  );
}


function getScoreMessage(
  score: number
): string {

  if (score >= 90) {
    return "You are highly competitive for your target career.";
  }

  if (score >= 75) {
    return "You are career ready. Keep improving your strongest gaps.";
  }

  if (score >= 60) {
    return "You are almost ready. Focus on your remaining skill gaps.";
  }

  if (score >= 40) {
    return "You are developing. Continue building skills and experience.";
  }

  return "Your profile needs improvement before you become career ready.";
}


export default function CareerScorePage() {

  const router = useRouter();

  const [score, setScore] =
    useState<CareerScore | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const fetchScore = async () => {

    try {

      const response =
        await api.get<CareerScore>(
          "/career-score/my"
        );

      setScore(response.data);

    } catch {

      setScore(null);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchScore();
  }, []);


  const generateScore = async () => {

    setGenerating(true);

    try {

      const response =
        await api.post<CareerScore>(
          "/career-score/generate"
        );

      setScore(response.data);

    } catch (error) {

      console.error(
        "Career score generation error:",
        error
      );

    } finally {

      setGenerating(false);

    }
  };


  if (loading) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">

        <div className="flex flex-col items-center gap-3">

          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />

          <p className="text-sm text-slate-400">
            Loading Career Score...
          </p>

        </div>

      </main>
    );
  }


  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/career-intelligence"
                )
              }
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>


            <div>

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-indigo-600/20 p-3">

                  <Target className="h-6 w-6 text-indigo-400" />

                </div>

                <div>

                  <h1 className="text-2xl font-bold">
                    Career Score
                  </h1>

                  <p className="text-sm text-slate-400">
                    Your overall career readiness
                  </p>

                </div>

              </div>

            </div>

          </div>


          <button
            type="button"
            onClick={generateScore}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {generating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}

            <span className="hidden sm:inline">
              {generating
                ? "Calculating..."
                : "Recalculate"}
            </span>

          </button>

        </div>


        {!score ? (

          /* EMPTY STATE */

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

            <div className="mx-auto mb-5 w-fit rounded-2xl bg-indigo-600/20 p-5">

              <Brain className="h-10 w-10 text-indigo-400" />

            </div>

            <h2 className="text-2xl font-bold">
              Calculate Your Career Score
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
              CareerAI will analyze your resume,
              skills, experience, education, skill
              gaps and learning progress.
            </p>

            <button
              type="button"
              onClick={generateScore}
              disabled={generating}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-50"
            >

              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <TrendingUp className="h-5 w-5" />
              )}

              Calculate Career Score

            </button>

          </div>

        ) : (

          <div className="space-y-8">

            {/* OVERALL SCORE */}

            <section className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-8">

              <div className="grid gap-8 md:grid-cols-[280px_1fr] md:items-center">

                <div className="text-center">

                  <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border-8 border-indigo-500/30">

                    <div>

                      <div className="text-6xl font-bold text-indigo-400">
                        {Math.round(
                          score.overall_score
                        )}%
                      </div>

                      <div className="mt-2 text-sm text-slate-400">
                        Career Score
                      </div>

                    </div>

                  </div>

                </div>


                <div>

                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-300">

                    <CheckCircle className="h-4 w-4" />

                    {score.status}

                  </div>


                  <h2 className="text-2xl font-bold">
                    {getScoreMessage(
                      score.overall_score
                    )}
                  </h2>


                  <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                    Your Career Score combines multiple
                    areas of your CareerAI profile instead
                    of relying only on your resume.
                  </p>

                </div>

              </div>

            </section>


            {/* SCORE BREAKDOWN */}

            <section>

              <div className="mb-5">

                <h2 className="text-xl font-bold">
                  Score Breakdown
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Understand what is affecting your
                  overall career readiness.
                </p>

              </div>


              <div className="grid gap-4 md:grid-cols-2">

                <ScoreItem
                  label="Resume Quality"
                  score={
                    score.resume_score
                  }
                />

                <ScoreItem
                  label="Skills Readiness"
                  score={
                    score.skills_score
                  }
                />

                <ScoreItem
                  label="Experience"
                  score={
                    score.experience_score
                  }
                />

                <ScoreItem
                  label="Education"
                  score={
                    score.education_score
                  }
                />

                <ScoreItem
                  label="Skill Gap Readiness"
                  score={
                    score.skill_gap_score
                  }
                />

                <ScoreItem
                  label="Learning Progress"
                  score={
                    score.learning_progress_score
                  }
                />

              </div>

            </section>


            {/* RECOMMENDATIONS */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="mb-5 flex items-center gap-3">

                <div className="rounded-xl bg-indigo-600/20 p-3">

                  <TrendingUp className="h-5 w-5 text-indigo-400" />

                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Recommendations
                  </h2>

                  <p className="text-sm text-slate-400">
                    Actions that can improve your score
                  </p>

                </div>

              </div>


              <div className="space-y-3">

                {(() => {

                  let recommendations: string[] = [];

                  try {

                    const parsed =
                      JSON.parse(
                        score.recommendations ||
                        "[]"
                      );

                    if (
                      Array.isArray(parsed)
                    ) {
                      recommendations =
                        parsed.filter(
                          (item): item is string =>
                            typeof item ===
                            "string"
                        );
                    }

                  } catch {

                    recommendations = [];

                  }


                  return recommendations.map(
                    (
                      recommendation,
                      index
                    ) => (

                      <div
                        key={`${index}-${recommendation}`}
                        className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
                      >

                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />

                        <p className="text-sm leading-6 text-slate-300">
                          {recommendation}
                        </p>

                      </div>

                    )
                  );

                })()}

              </div>

            </section>


            {/* QUICK ACTIONS */}

            <section>

              <h2 className="mb-4 text-xl font-bold">
                Improve Your Career Score
              </h2>

              <div className="grid gap-4 md:grid-cols-3">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/resume"
                    )
                  }
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-indigo-500/50"
                >

                  <h3 className="font-semibold">
                    Improve Resume
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Improve your resume and ATS performance.
                  </p>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/career-intelligence/skill-gap"
                    )
                  }
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-indigo-500/50"
                >

                  <h3 className="font-semibold">
                    Fix Skill Gaps
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Identify and improve missing skills.
                  </p>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/career-intelligence/learning-roadmap"
                    )
                  }
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-indigo-500/50"
                >

                  <h3 className="font-semibold">
                    Continue Learning
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Continue your personalized roadmap.
                  </p>

                </button>

              </div>

            </section>

          </div>

        )}

      </div>

    </main>
  );
}