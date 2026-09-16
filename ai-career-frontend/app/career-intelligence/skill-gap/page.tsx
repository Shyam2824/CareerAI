"use client";

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Brain,
  CheckCircle,
  XCircle,
  Flame,
  BookOpen,
  Loader2,
  RefreshCw,
  Target,
} from "lucide-react";

import { useRouter } from "next/navigation";

import api from "@/services/api";


interface SkillGap {
  id: number;
  user_id: number;
  target_role: string;

  user_skills: string | null;
  required_skills: string | null;
  missing_skills: string | null;

  high_priority_skills: string | null;
  medium_priority_skills: string | null;
  low_priority_skills: string | null;

  readiness_score: number;

  recommendations: string | null;
}


export default function SkillGapPage() {

  const router = useRouter();

  const [analysis, setAnalysis] =
    useState<SkillGap | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadAnalysis();
  }, []);


  const loadAnalysis = async () => {

    try {

      const response =
        await api.get("/skill-gap/my");

      setAnalysis(response.data);

    } catch {

      setAnalysis(null);

    } finally {

      setLoading(false);

    }
  };


  const analyzeSkills = async () => {

    setAnalyzing(true);
    setError("");

    try {

      const response =
        await api.post("/skill-gap/analyze");

      setAnalysis(response.data);

    } catch (err: unknown) {

      console.error(
        "Skill gap error:",
        err
      );

      setError(
        "Unable to analyze your skill gap. Please complete your Career Profile first."
      );

    } finally {

      setAnalyzing(false);

    }
  };


  const toArray = (
    value: string | null
  ): string[] => {

    if (!value) {
      return [];
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };


  const getScoreLabel = (
    score: number
  ) => {

    if (score >= 80) {
      return "Excellent";
    }

    if (score >= 60) {
      return "Good";
    }

    if (score >= 40) {
      return "Needs Improvement";
    }

    return "Beginner";
  };


  if (loading) {

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />

      </div>
    );

  }


  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Back */}

        <button
          onClick={() =>
            router.push(
              "/dashboard/career-intelligence"
            )
          }
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8"
        >

          <ArrowLeft className="h-4 w-4" />

          Career Intelligence

        </button>


        {/* Header */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>

            <div className="flex items-center gap-3 mb-3">

              <div className="rounded-xl bg-indigo-500/20 p-3">

                <Brain className="h-7 w-7 text-indigo-400" />

              </div>

              <h1 className="text-3xl font-bold">
                Skill Gap Intelligence
              </h1>

            </div>

            <p className="text-slate-400">
              Discover what skills you need for
              your target career.
            </p>

          </div>


          <button
            onClick={analyzeSkills}
            disabled={analyzing}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-50"
          >

            {analyzing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}

            {analyzing
              ? "Analyzing..."
              : "Analyze Skill Gap"}

          </button>

        </div>


        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}


        {!analysis ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

            <Target className="mx-auto h-12 w-12 text-indigo-400 mb-4" />

            <h2 className="text-2xl font-bold mb-3">
              Analyze Your Skill Gap
            </h2>

            <p className="text-slate-400 max-w-xl mx-auto mb-6">
              Complete your Career Profile and
              run an analysis to discover the skills
              required for your target role.
            </p>

            <button
              onClick={analyzeSkills}
              disabled={analyzing}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-50"
            >
              {analyzing
                ? "Analyzing..."
                : "Start Analysis"}
            </button>

          </div>

        ) : (

          <>

            {/* Readiness */}

            <section className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 mb-8">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                <div>

                  <p className="text-sm text-indigo-300">
                    Career Readiness
                  </p>

                  <h2 className="text-3xl font-bold mt-1">
                    {analysis.target_role}
                  </h2>

                  <p className="text-slate-400 mt-2">
                    {getScoreLabel(
                      analysis.readiness_score
                    )}
                  </p>

                </div>


                <div className="text-right">

                  <div className="text-5xl font-bold text-indigo-400">
                    {analysis.readiness_score}%
                  </div>

                  <p className="text-sm text-slate-400 mt-1">
                    Skill Match
                  </p>

                </div>

              </div>


              <div className="h-4 rounded-full bg-slate-900 mt-6 overflow-hidden">

                <div
                  className="h-full bg-indigo-500 transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        analysis.readiness_score,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

            </section>


            {/* Skills You Have */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 mb-6">

              <div className="flex items-center gap-3 mb-5">

                <CheckCircle className="text-green-400" />

                <h2 className="text-xl font-semibold">
                  Skills You Have
                </h2>

              </div>


              <div className="flex flex-wrap gap-2">

                {toArray(
                  analysis.user_skills
                ).map((skill) => (

                  <span
                    key={skill}
                    className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300"
                  >
                    ✓ {skill}
                  </span>

                ))}

              </div>

            </section>


            {/* Missing Skills */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 mb-6">

              <div className="flex items-center gap-3 mb-5">

                <XCircle className="text-red-400" />

                <h2 className="text-xl font-semibold">
                  Missing Skills
                </h2>

              </div>


              <div className="flex flex-wrap gap-2">

                {toArray(
                  analysis.missing_skills
                ).map((skill) => (

                  <span
                    key={skill}
                    className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                  >
                    {skill}
                  </span>

                ))}

              </div>

            </section>


            {/* Priority */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* High */}

              <PriorityCard
                title="High Priority"
                icon={
                  <Flame className="text-red-400" />
                }
                skills={toArray(
                  analysis.high_priority_skills
                )}
                type="high"
              />


              {/* Medium */}

              <PriorityCard
                title="Medium Priority"
                icon={
                  <Target className="text-yellow-400" />
                }
                skills={toArray(
                  analysis.medium_priority_skills
                )}
                type="medium"
              />


              {/* Low */}

              <PriorityCard
                title="Low Priority"
                icon={
                  <BookOpen className="text-green-400" />
                }
                skills={toArray(
                  analysis.low_priority_skills
                )}
                type="low"
              />

            </div>


            {/* Learning Recommendations */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex items-center gap-3 mb-6">

                <BookOpen className="text-indigo-400" />

                <div>

                  <h2 className="text-xl font-semibold">
                    Recommended Next Steps
                  </h2>

                  <p className="text-sm text-slate-400">
                    Focus on these skills to improve
                    your career readiness.
                  </p>

                </div>

              </div>


              <div className="space-y-3">

                {analysis.recommendations
                  ?.split("\n")
                  .filter(Boolean)
                  .map((recommendation) => (

                    <div
                      key={recommendation}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-300"
                    >
                      {recommendation}
                    </div>

                  ))}

              </div>

            </section>

          </>

        )}

      </div>

    </main>
  );
}


/* ==========================================
   PRIORITY CARD
========================================== */

function PriorityCard({
  title,
  icon,
  skills,
  type,
}: {
  title: string;
  icon: React.ReactNode;
  skills: string[];
  type: "high" | "medium" | "low";
}) {

  const style =
    type === "high"
      ? "border-red-500/20"
      : type === "medium"
      ? "border-yellow-500/20"
      : "border-green-500/20";

  return (
    <section
      className={`rounded-2xl border ${style} bg-slate-900 p-6`}
    >

      <div className="flex items-center gap-3 mb-5">

        {icon}

        <h2 className="font-semibold">
          {title}
        </h2>

      </div>


      <div className="space-y-2">

        {skills.length === 0 ? (

          <p className="text-sm text-slate-500">
            No skills in this category.
          </p>

        ) : (

          skills.map((skill) => (

            <div
              key={skill}
              className="rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-300"
            >
              {skill}
            </div>

          ))

        )}

      </div>

    </section>
  );
}