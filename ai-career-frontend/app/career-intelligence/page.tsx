"use client";

import {
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle,
  ChevronRight,
  GraduationCap,
  Loader2,
  MessageCircle,
  RefreshCw,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import  api  from "@/services/api";


interface CareerProfile {
  current_role: string;
  target_role: string;
  years_of_experience: number | null;
  education: string;
  preferred_location: string;
  preferred_work_mode: string;
  technical_skills: string;
  career_goal: string;
  profile_score?: number;
}


interface CareerScore {
  overall_score: number;
  resume_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  skill_gap_score: number;
  learning_progress_score: number;
  status: string;
}


interface SkillGap {
  target_role: string;
  readiness_score: number;
  missing_skills: string;
  high_priority_skills: string;
}


interface LearningRoadmap {
  target_role: string;
  current_phase: number;
  overall_progress: number;
  estimated_months: number;
}


interface CareerPath {
  current_role: string | null;
  target_role: string;
  readiness_score: number;
  estimated_months: number;
}


interface DashboardData {
  profile: CareerProfile | null;
  score: CareerScore | null;
  skillGap: SkillGap | null;
  roadmap: LearningRoadmap | null;
  careerPath: CareerPath | null;
}


const emptyData: DashboardData = {
  profile: null,
  score: null,
  skillGap: null,
  roadmap: null,
  careerPath: null,
};


function getScoreStatus(score: number): string {
  if (score >= 90) return "Highly Competitive";
  if (score >= 75) return "Career Ready";
  if (score >= 60) return "Almost Ready";
  if (score >= 40) return "Developing";

  return "Needs Improvement";
}


function parseList(value: string | null | undefined): string[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string =>
          typeof item === "string"
      );
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}


export default function PersonalizedCareerDashboard() {
  const router = useRouter();

  const [data, setData] =
    useState<DashboardData>(emptyData);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  const fetchDashboard = async () => {
    try {
      const [
        profileResponse,
        scoreResponse,
        skillGapResponse,
        roadmapResponse,
        careerPathResponse,
      ] = await Promise.allSettled([
        api.get<CareerProfile>(
          "/career-profile"
        ),

        api.get<CareerScore>(
          "/career-score/my"
        ),

        api.get<SkillGap[]>(
          "/skill-gap/my"
        ),

        api.get<LearningRoadmap>(
          "/learning-roadmap/my"
        ),

        api.get<CareerPath[]>(
          "/career-path/my"
        ),
      ]);


      let profile: CareerProfile | null = null;
      let score: CareerScore | null = null;
      let skillGap: SkillGap | null = null;
      let roadmap: LearningRoadmap | null = null;
      let careerPath: CareerPath | null = null;


      if (
        profileResponse.status === "fulfilled"
      ) {
        profile =
          profileResponse.value.data;
      }


      if (
        scoreResponse.status === "fulfilled"
      ) {
        score =
          scoreResponse.value.data;
      }


      if (
        skillGapResponse.status === "fulfilled"
      ) {
        const result =
          skillGapResponse.value.data;

        if (Array.isArray(result)) {
          skillGap =
            result.length > 0
              ? result[0]
              : null;
        }
      }


      if (
        roadmapResponse.status === "fulfilled"
      ) {
        roadmap =
          roadmapResponse.value.data;
      }


      if (
        careerPathResponse.status === "fulfilled"
      ) {
        const result =
          careerPathResponse.value.data;

        if (Array.isArray(result)) {
          careerPath =
            result.length > 0
              ? result[0]
              : null;
        }
      }


      setData({
        profile,
        score,
        skillGap,
        roadmap,
        careerPath,
      });

    } catch (error) {
      console.error(
        "Career dashboard error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, []);


  const refreshDashboard = async () => {
    setRefreshing(true);
    await fetchDashboard();
  };


  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />

          <p className="text-sm text-slate-400">
            Loading your Career Intelligence...
          </p>
        </div>
      </main>
    );
  }


  const score =
    data.score?.overall_score ?? 0;

  const missingSkills =
    parseList(
      data.skillGap?.missing_skills
    );

  const highPrioritySkills =
    parseList(
      data.skillGap?.high_priority_skills
    );


  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-3">

              <div className="rounded-xl bg-indigo-600/20 p-3">

                <Brain className="h-7 w-7 text-indigo-400" />

              </div>

              <div>

                <h1 className="text-3xl font-bold">
                  Career Intelligence
                </h1>

                <p className="text-sm text-slate-400">
                  Your personalized career command center
                </p>

              </div>

            </div>


            {data.profile?.target_role && (
              <p className="text-slate-400">
                Your target:
                <span className="ml-2 font-semibold text-white">
                  {data.profile.target_role}
                </span>
              </p>
            )}

          </div>


          <button
            type="button"
            onClick={refreshDashboard}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold transition hover:bg-slate-800 disabled:opacity-50"
          >

            {refreshing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}

            Refresh Intelligence

          </button>

        </div>


        {/* ==================================================
            CAREER SCORE HERO
        ================================================== */}

        <section className="mb-8 overflow-hidden rounded-2xl border border-indigo-500/30 bg-indigo-500/10">

          <div className="grid gap-8 p-8 md:grid-cols-[220px_1fr] md:items-center">

            <div className="flex justify-center">

              <div className="flex h-48 w-48 items-center justify-center rounded-full border-8 border-indigo-500/30">

                <div className="text-center">

                  <div className="text-5xl font-bold text-indigo-400">
                    {Math.round(score)}%
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Career Score
                  </p>

                </div>

              </div>

            </div>


            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-300">

                <CheckCircle className="h-4 w-4" />

                {data.score
                  ? data.score.status
                  : getScoreStatus(score)}

              </div>


              <h2 className="text-2xl font-bold">
                {score >= 75
                  ? "You are on the right track."
                  : "Let's improve your career readiness."}
              </h2>


              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                CareerAI combines your resume,
                skills, experience, education,
                skill gaps and learning progress
                to measure your career readiness.
              </p>


              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard/career-intelligence/career-score"
                  )
                }
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 transition hover:text-indigo-300"
              >
                View detailed Career Score
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>

          </div>

        </section>


        {/* ==================================================
            PROFILE + SKILLS
        ================================================== */}

        <div className="mb-8 grid gap-6 lg:grid-cols-2">

          {/* PROFILE */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-indigo-600/20 p-3">

                  <UserRound className="h-5 w-5 text-indigo-400" />

                </div>

                <div>

                  <h2 className="font-semibold">
                    Career Profile
                  </h2>

                  <p className="text-xs text-slate-500">
                    Your career identity
                  </p>

                </div>

              </div>


              <span className="text-xl font-bold text-indigo-400">
                {Math.round(
                  data.profile?.profile_score ?? 0
                )}%
              </span>

            </div>


            {data.profile ? (

              <div className="space-y-3">

                <InfoRow
                  label="Current Role"
                  value={
                    data.profile.current_role ||
                    "Not set"
                  }
                />

                <InfoRow
                  label="Target Role"
                  value={
                    data.profile.target_role ||
                    "Not set"
                  }
                />

                <InfoRow
                  label="Experience"
                  value={
                    data.profile.years_of_experience !==
                    null
                      ? `${data.profile.years_of_experience} years`
                      : "Not set"
                  }
                />

                <InfoRow
                  label="Work Mode"
                  value={
                    data.profile.preferred_work_mode ||
                    "Not set"
                  }
                />


                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/career-intelligence"
                    )
                  }
                  className="mt-3 flex items-center gap-2 text-sm font-semibold text-indigo-400"
                >
                  Edit Career Profile
                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>

            ) : (

              <EmptyCard
                text="Create your Career Profile to unlock personalized intelligence."
                button="Create Profile"
                onClick={() =>
                  router.push(
                    "/dashboard/career-intelligence"
                  )
                }
              />

            )}

          </section>


          {/* SKILL GAP */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-indigo-600/20 p-3">

                  <Target className="h-5 w-5 text-indigo-400" />

                </div>

                <div>

                  <h2 className="font-semibold">
                    Skill Gap
                  </h2>

                  <p className="text-xs text-slate-500">
                    Readiness for your target
                  </p>

                </div>

              </div>


              <span className="text-xl font-bold text-indigo-400">
                {Math.round(
                  data.skillGap?.readiness_score ?? 0
                )}%
              </span>

            </div>


            {data.skillGap ? (

              <>
                <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          data.skillGap.readiness_score,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>


                <p className="mb-3 text-sm text-slate-400">
                  Priority skills to improve:
                </p>


                <div className="flex flex-wrap gap-2">

                  {(highPrioritySkills.length > 0
                    ? highPrioritySkills
                    : missingSkills
                  )
                    .slice(0, 6)
                    .map((skill) => (

                      <span
                        key={skill}
                        className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300"
                      >
                        {skill}
                      </span>

                    ))}

                </div>


                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/career-intelligence/skill-gap"
                    )
                  }
                  className="mt-5 flex items-center gap-2 text-sm font-semibold text-indigo-400"
                >
                  View Skill Gap
                  <ArrowRight className="h-4 w-4" />
                </button>

              </>

            ) : (

              <EmptyCard
                text="Run Skill Gap Intelligence to discover what you should improve."
                button="Analyze Skill Gap"
                onClick={() =>
                  router.push(
                    "/dashboard/career-intelligence/skill-gap"
                  )
                }
              />

            )}

          </section>

        </div>


        {/* ==================================================
            CAREER PATH + LEARNING
        ================================================== */}

        <div className="mb-8 grid gap-6 lg:grid-cols-2">

          {/* CAREER PATH */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="rounded-xl bg-indigo-600/20 p-3">

                <Route className="h-5 w-5 text-indigo-400" />

              </div>

              <div>

                <h2 className="font-semibold">
                  Career Path
                </h2>

                <p className="text-xs text-slate-500">
                  Your recommended transition
                </p>

              </div>

            </div>


            {data.careerPath ? (

              <>

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-slate-800 px-4 py-3 text-sm">
                    {data.careerPath.current_role ||
                      "Current Role"}
                  </div>

                  <ArrowRight className="h-5 w-5 text-indigo-400" />

                  <div className="rounded-xl bg-indigo-600/20 px-4 py-3 text-sm font-semibold text-indigo-300">
                    {data.careerPath.target_role}
                  </div>

                </div>


                <div className="mt-5 grid grid-cols-2 gap-3">

                  <Metric
                    label="Readiness"
                    value={`${Math.round(
                      data.careerPath.readiness_score
                    )}%`}
                  />

                  <Metric
                    label="Estimated Time"
                    value={`${data.careerPath.estimated_months} months`}
                  />

                </div>


                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/career-intelligence/career-path"
                    )
                  }
                  className="mt-5 flex items-center gap-2 text-sm font-semibold text-indigo-400"
                >
                  View Career Path
                  <ArrowRight className="h-4 w-4" />
                </button>

              </>

            ) : (

              <EmptyCard
                text="Generate your personalized career path."
                button="Generate Career Path"
                onClick={() =>
                  router.push(
                    "/dashboard/career-intelligence/career-path"
                  )
                }
              />

            )}

          </section>


          {/* LEARNING ROADMAP */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="rounded-xl bg-indigo-600/20 p-3">

                <GraduationCap className="h-5 w-5 text-indigo-400" />

              </div>

              <div>

                <h2 className="font-semibold">
                  Learning Roadmap
                </h2>

                <p className="text-xs text-slate-500">
                  Your personalized learning plan
                </p>

              </div>

            </div>


            {data.roadmap ? (

              <>

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-sm text-slate-400">
                    Overall Progress
                  </span>

                  <span className="font-semibold">
                    {Math.round(
                      data.roadmap.overall_progress
                    )}%
                  </span>

                </div>


                <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          data.roadmap.overall_progress,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>


                <div className="mt-5 grid grid-cols-2 gap-3">

                  <Metric
                    label="Current Phase"
                    value={`Phase ${data.roadmap.current_phase}`}
                  />

                  <Metric
                    label="Duration"
                    value={`${data.roadmap.estimated_months} months`}
                  />

                </div>


                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/career-intelligence/learning-roadmap"
                    )
                  }
                  className="mt-5 flex items-center gap-2 text-sm font-semibold text-indigo-400"
                >
                  Continue Learning
                  <ArrowRight className="h-4 w-4" />
                </button>

              </>

            ) : (

              <EmptyCard
                text="Generate a personalized learning roadmap based on your career goals."
                button="Create Learning Roadmap"
                onClick={() =>
                  router.push(
                    "/dashboard/career-intelligence/learning-roadmap"
                  )
                }
              />

            )}

          </section>

        </div>


        {/* ==================================================
            AI CAREER CHAT
        ================================================== */}

        <section className="mb-8 overflow-hidden rounded-2xl border border-indigo-500/30 bg-linear-to-r from-indigo-500/10 to-slate-900 p-6">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-indigo-600/20 p-3">

                <MessageCircle className="h-6 w-6 text-indigo-400" />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  AI Career Assistant
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                  Ask CareerAI about your skills,
                  resume, career path, learning roadmap,
                  job preparation and career growth.
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/career-intelligence/career-chat"
                )
              }
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
            >

              <Sparkles className="h-5 w-5" />

              Open AI Career Chat

            </button>

          </div>

        </section>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <section>

          <div className="mb-5">

            <h2 className="text-xl font-bold">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Continue improving your career profile.
            </p>

          </div>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <QuickAction
              icon={<Briefcase className="h-5 w-5" />}
              title="Find Jobs"
              description="Find jobs matching your target role."
              onClick={() =>
                router.push("/job-match")
              }
            />

            <QuickAction
              icon={<TrendingUp className="h-5 w-5" />}
              title="Improve Resume"
              description="Improve your resume and ATS score."
              onClick={() =>
                router.push("/resume-improve")
              }
            />

            <QuickAction
              icon={<GraduationCap className="h-5 w-5" />}
              title="Learning Roadmap"
              description="Continue your learning plan."
              onClick={() =>
                router.push(
                  "/dashboard/career-intelligence/learning-roadmap"
                )
              }
            />

            <QuickAction
              icon={<MessageCircle className="h-5 w-5" />}
              title="Career Chat"
              description="Ask your AI career assistant."
              onClick={() =>
                router.push(
                  "/dashboard/career-intelligence/career-chat"
                )
              }
            />

          </div>

        </section>

      </div>

    </main>
  );
}


/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-sm font-medium text-slate-200">
        {value}
      </span>

    </div>
  );
}


/* ============================================================
   METRIC
============================================================ */

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-white">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   EMPTY CARD
============================================================ */

function EmptyCard({
  text,
  button,
  onClick,
}: {
  text: string;
  button: string;
  onClick: () => void;
}) {

  return (
    <div>

      <p className="text-sm leading-6 text-slate-400">
        {text}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-indigo-500"
      >

        {button}

        <ArrowRight className="h-4 w-4" />

      </button>

    </div>
  );
}


/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
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
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-indigo-500/50 hover:bg-slate-900/80"
    >

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-5 text-slate-400">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-400 opacity-0 transition group-hover:opacity-100">
        Open
        <ChevronRight className="h-3 w-3" />
      </div>

    </button>
  );
}