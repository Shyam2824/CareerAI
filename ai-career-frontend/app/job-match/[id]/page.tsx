"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/services/api";

import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Target,
  Brain,
  Briefcase,
  Search,
  Lightbulb,
} from "lucide-react";


interface Suggestion {
  type: string;
  priority: string;
  suggestion: string;
}


interface JobMatchResult {
  id: number;
  resume_id: number;
  job_title: string | null;
  company_name: string | null;

  match_score: number;
  skills_score: number;
  keyword_score: number;
  experience_score: number;

  matched_skills: string[];
  missing_skills: string[];

  matched_keywords: string[];
  missing_keywords: string[];

  suggestions: Suggestion[];

  created_at: string | null;
}


export default function JobMatchResultPage() {

  const params = useParams();

  const matchId = params.id;

  const [result, setResult] =
    useState<JobMatchResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================
  // FETCH JOB MATCH RESULT
  // ==========================================

  useEffect(() => {

    if (!matchId) return;

    const fetchResult = async () => {

      try {

        setLoading(true);

        const response = await api.get<JobMatchResult>(
          `/job-match/${matchId}`
        );

        setResult(response.data);

      } catch (err) {

        console.error(
          "Failed to load job match:",
          err
        );

        setError(
          "Failed to load job match analysis."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchResult();

  }, [matchId]);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <main className="
        min-h-screen
        bg-slate-950
        text-white
        flex
        items-center
        justify-center
      ">

        <div className="text-center">

          <div className="
            w-12
            h-12
            border-4
            border-blue-500
            border-t-transparent
            rounded-full
            animate-spin
            mx-auto
          " />

          <p className="mt-4 text-slate-400">

            Loading analysis...

          </p>

        </div>

      </main>

    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error || !result) {

    return (

      <main className="
        min-h-screen
        bg-slate-950
        text-white
        flex
        items-center
        justify-center
      ">

        <div className="text-center">

          <p className="text-red-400">

            {error || "Analysis not found."}

          </p>

          <Link
            href="/job-match"
            className="
              inline-block
              mt-5
              bg-blue-600
              px-5
              py-3
              rounded-lg
              hover:bg-blue-500
            "
          >

            Back to Job Match

          </Link>

        </div>

      </main>

    );

  }


  // ==========================================
  // SCORE COLOR
  // ==========================================

  const getScoreColor = (
    score: number
  ) => {

    if (score >= 80) {
      return "text-green-400";
    }

    if (score >= 60) {
      return "text-yellow-400";
    }

    return "text-red-400";

  };


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getScoreBackground = (
    score: number
  ) => {

    if (score >= 80) {
      return "border-green-500";
    }

    if (score >= 60) {
      return "border-yellow-500";
    }

    return "border-red-500";

  };


  return (

    <main className="
      min-h-screen
      bg-slate-950
      text-white
    ">

      <div className="
        max-w-7xl
        mx-auto
        px-6
        py-10
      ">


        {/* ======================================
        BACK BUTTON
        ====================================== */}

        <Link
          href="/job-match"
          className="
            inline-flex
            items-center
            gap-2
            text-slate-400
            hover:text-white
            transition
            mb-8
          "
        >

          <ArrowLeft size={18} />

          Back to Job Match

        </Link>


        {/* ======================================
        HEADER
        ====================================== */}

        <div className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-6
          mb-10
        ">

          <div>

            <h1 className="
              text-3xl
              md:text-4xl
              font-bold
            ">

              Job Match Result

            </h1>

            <div className="
              flex
              flex-wrap
              gap-2
              mt-3
              text-slate-400
            ">

              {result.job_title && (

                <span>

                  {result.job_title}

                </span>

              )}

              {result.company_name && (

                <>

                  <span>•</span>

                  <span>

                    {result.company_name}

                  </span>

                </>

              )}

            </div>

          </div>


          {/* OVERALL SCORE */}

          <div className="
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            px-6
            py-4
          ">

            <p className="
              text-sm
              text-slate-400
              text-center
            ">

              Overall Match

            </p>

            <p className={`
              text-4xl
              font-bold
              text-center
              mt-1
              ${getScoreColor(
                result.match_score
              )}
            `}>

              {Number(
                result.match_score
              ).toFixed(1)}%

            </p>

          </div>

        </div>


        {/* ======================================
        SCORE CARDS
        ====================================== */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
          mb-10
        ">


          {/* SKILLS */}

          <div className="
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            p-6
          ">

            <div className="
              flex
              justify-between
              items-center
            ">

              <div>

                <p className="text-slate-400">

                  Skills Match

                </p>

                <p className={`
                  text-3xl
                  font-bold
                  mt-2
                  ${getScoreColor(
                    result.skills_score
                  )}
                `}>

                  {Number(
                    result.skills_score
                  ).toFixed(1)}%

                </p>

              </div>

              <Target
                size={32}
                className="text-blue-400"
              />

            </div>

          </div>


          {/* KEYWORDS */}

          <div className="
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            p-6
          ">

            <div className="
              flex
              justify-between
              items-center
            ">

              <div>

                <p className="text-slate-400">

                  Keyword Match

                </p>

                <p className={`
                  text-3xl
                  font-bold
                  mt-2
                  ${getScoreColor(
                    result.keyword_score
                  )}
                `}>

                  {Number(
                    result.keyword_score
                  ).toFixed(1)}%

                </p>

              </div>

              <Search
                size={32}
                className="text-purple-400"
              />

            </div>

          </div>


          {/* EXPERIENCE */}

          <div className="
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            p-6
          ">

            <div className="
              flex
              justify-between
              items-center
            ">

              <div>

                <p className="text-slate-400">

                  Experience Match

                </p>

                <p className={`
                  text-3xl
                  font-bold
                  mt-2
                  ${getScoreColor(
                    result.experience_score
                  )}
                `}>

                  {Number(
                    result.experience_score
                  ).toFixed(1)}%

                </p>

              </div>

              <Briefcase
                size={32}
                className="text-orange-400"
              />

            </div>

          </div>

        </div>


        {/* ======================================
        MATCHED AND MISSING SKILLS
        ====================================== */}

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-6
          mb-8
        ">


          {/* MATCHED SKILLS */}

          <div className="
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            p-6
          ">

            <div className="
              flex
              items-center
              gap-2
              mb-5
            ">

              <CheckCircle
                className="text-green-400"
                size={22}
              />

              <h2 className="
                text-xl
                font-semibold
              ">

                Matched Skills

              </h2>

            </div>


            {result.matched_skills.length > 0 ? (

              <div className="
                flex
                flex-wrap
                gap-2
              ">

                {result.matched_skills.map(
                  (skill) => (

                    <span
                      key={skill}
                      className="
                        bg-green-500/10
                        text-green-400
                        border
                        border-green-500/20
                        px-3
                        py-1.5
                        rounded-full
                        text-sm
                      "
                    >

                      {skill}

                    </span>

                  )
                )}

              </div>

            ) : (

              <p className="text-slate-400">

                No matched skills found.

              </p>

            )}

          </div>


          {/* MISSING SKILLS */}

          <div className="
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            p-6
          ">

            <div className="
              flex
              items-center
              gap-2
              mb-5
            ">

              <XCircle
                className="text-red-400"
                size={22}
              />

              <h2 className="
                text-xl
                font-semibold
              ">

                Missing Skills

              </h2>

            </div>


            {result.missing_skills.length > 0 ? (

              <div className="
                flex
                flex-wrap
                gap-2
              ">

                {result.missing_skills.map(
                  (skill) => (

                    <span
                      key={skill}
                      className="
                        bg-red-500/10
                        text-red-400
                        border
                        border-red-500/20
                        px-3
                        py-1.5
                        rounded-full
                        text-sm
                      "
                    >

                      {skill}

                    </span>

                  )
                )}

              </div>

            ) : (

              <p className="text-slate-400">

                Excellent! No important skills missing.

              </p>

            )}

          </div>

        </div>


        {/* ======================================
        KEYWORDS
        ====================================== */}

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-6
          mb-8
        ">


          {/* MATCHED KEYWORDS */}

          <div className="
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            p-6
          ">

            <h2 className="
              text-xl
              font-semibold
              mb-5
            ">

              Matched Keywords

            </h2>


            {result.matched_keywords.length > 0 ? (

              <div className="
                flex
                flex-wrap
                gap-2
              ">

                {result.matched_keywords.map(
                  (keyword) => (

                    <span
                      key={keyword}
                      className="
                        bg-blue-500/10
                        text-blue-400
                        border
                        border-blue-500/20
                        px-3
                        py-1.5
                        rounded-full
                        text-sm
                      "
                    >

                      {keyword}

                    </span>

                  )
                )}

              </div>

            ) : (

              <p className="text-slate-400">

                No keyword matches found.

              </p>

            )}

          </div>


          {/* MISSING KEYWORDS */}

          <div className="
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            p-6
          ">

            <h2 className="
              text-xl
              font-semibold
              mb-5
            ">

              Missing Keywords

            </h2>


            {result.missing_keywords.length > 0 ? (

              <div className="
                flex
                flex-wrap
                gap-2
              ">

                {result.missing_keywords.map(
                  (keyword) => (

                    <span
                      key={keyword}
                      className="
                        bg-yellow-500/10
                        text-yellow-400
                        border
                        border-yellow-500/20
                        px-3
                        py-1.5
                        rounded-full
                        text-sm
                      "
                    >

                      {keyword}

                    </span>

                  )
                )}

              </div>

            ) : (

              <p className="text-slate-400">

                No important keywords missing.

              </p>

            )}

          </div>

        </div>


        {/* ======================================
        AI RECOMMENDATIONS
        ====================================== */}

        <div className="
          bg-slate-900
          border
          border-slate-800
          rounded-xl
          p-7
          mb-10
        ">

          <div className="
            flex
            items-center
            gap-3
            mb-6
          ">

            <div className="
              bg-purple-500/10
              p-3
              rounded-lg
            ">

              <Brain
                className="text-purple-400"
                size={24}
              />

            </div>

            <div>

              <h2 className="
                text-xl
                font-semibold
              ">

                AI Recommendations

              </h2>

              <p className="
                text-sm
                text-slate-400
                mt-1
              ">

                Improve your resume for this specific job.

              </p>

            </div>

          </div>


          <div className="space-y-4">

            {result.suggestions.map(
              (item, index) => (

                <div
                  key={index}
                  className="
                    flex
                    gap-4
                    bg-slate-950
                    border
                    border-slate-800
                    rounded-lg
                    p-4
                  "
                >

                  <Lightbulb
                    className="text-yellow-400 shrink-0"
                    size={20}
                  />

                  <div>

                    <div className="
                      flex
                      items-center
                      gap-2
                      mb-1
                    ">

                      <span className="
                        text-xs
                        uppercase
                        text-slate-500
                      ">

                        {item.priority} priority

                      </span>

                    </div>

                    <p className="
                      text-sm
                      text-slate-300
                    ">

                      {item.suggestion}

                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>


        {/* ======================================
        ACTION BUTTONS
        ====================================== */}

        <div className="
          flex
          flex-wrap
          gap-4
        ">

          <Link
            href="/job-match"
            className="
              bg-blue-600
              hover:bg-blue-500
              transition
              px-6
              py-3
              rounded-lg
              font-medium
            "
          >

            Analyze Another Job

          </Link>


          <Link
            href="/"
            className="
              bg-slate-800
              hover:bg-slate-700
              transition
              px-6
              py-3
              rounded-lg
              font-medium
            "
          >

            Go to Dashboard

          </Link>

        </div>


      </div>

    </main>

  );
}