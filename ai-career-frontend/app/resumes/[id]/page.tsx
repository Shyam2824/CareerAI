"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";


interface Resume {
  id: number;
  file_name: string;
  file_url?: string;

  ats_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;

  detected_skills?: string;
  detected_sections?: string;

  strengths?: string;
  improvements?: string;

  contact_info?: string;
  action_verbs?: string;
  achievements?: string;
  weak_phrases?: string;
  resume_length?: string;

  feedback?: string;
  created_at?: string;
}


export default function ResumeDetailsPage() {

  const [resume, setResume] = useState<Resume | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [resumeId, setResumeId] = useState<string>("");


  // ==========================================
  // GET RESUME ID FROM URL
  // ==========================================

  useEffect(() => {

    const pathParts = window.location.pathname.split("/");

    const id = pathParts[pathParts.length - 1];

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResumeId(id);

  }, []);


  // ==========================================
  // FETCH RESUME
  // ==========================================

  useEffect(() => {

    if (!resumeId) return;

    const fetchResume = async () => {

      try {

        setLoading(true);

        const response = await api.get(
          `/resumes/${resumeId}`
        );

        setResume(response.data);

      } catch (error) {

        console.error(
          "Failed to fetch resume:",
          error
        );

        setError(
          "Failed to load resume analysis."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchResume();

  }, [resumeId]);


  // ==========================================
  // SAFE JSON PARSER
  // ==========================================

  const parseJSON = (data?: string) => {

    if (!data) return null;

    try {

      return JSON.parse(data);

    } catch {

      return null;

    }

  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-400">
            Loading resume analysis...
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error || !resume) {

    return (

      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Resume Not Found
          </h1>

          <p className="text-slate-400 mt-3">
            {error || "Unable to load resume."}
          </p>

          <Link
            href="/resumes"
            className="inline-block mt-6 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg"
          >
            Back to Resume History
          </Link>

        </div>

      </div>

    );

  }


  // ==========================================
  // PARSE DATA
  // ==========================================

  const skills =
    parseJSON(resume.detected_skills) || [];

  const sections =
    parseJSON(resume.detected_sections) || {};

  const strengths =
    parseJSON(resume.strengths) || [];

  const improvements =
    parseJSON(resume.improvements) || [];

  const contactInfo =
    parseJSON(resume.contact_info) || {};

  const actionVerbs =
    parseJSON(resume.action_verbs) || {};

  const achievements =
    parseJSON(resume.achievements) || {};

  const weakPhrases =
    parseJSON(resume.weak_phrases) || [];

  const resumeLength =
    parseJSON(resume.resume_length) || {};


  return (

    <main className="min-h-screen bg-slate-950 text-white">

      {/* ==========================================
      HEADER
      ========================================== */}

      <div className="border-b border-slate-800">

        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">

          <div>

            <Link
              href="/resumes"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              ← Back to Resume History
            </Link>

            <h1 className="text-2xl font-bold mt-3">
              Resume Analysis
            </h1>

            <p className="text-slate-400 mt-1">
              {resume.file_name}
            </p>

          </div>


          <div className="text-right">

            <p className="text-sm text-slate-400">
              ATS Score
            </p>

            <p className="text-4xl font-bold text-blue-400">

              {Number(
                resume.ats_score
              ).toFixed(1)}%

            </p>

          </div>

        </div>

      </div>


      <div className="max-w-7xl mx-auto px-6 py-10">


        {/* ==========================================
        SCORE CARDS
        ========================================== */}

        <div className="grid md:grid-cols-4 gap-5">

          <ScoreCard
            title="ATS Score"
            score={resume.ats_score}
          />

          <ScoreCard
            title="Skills"
            score={resume.skills_score}
          />

          <ScoreCard
            title="Experience"
            score={resume.experience_score}
          />

          <ScoreCard
            title="Education"
            score={resume.education_score}
          />

        </div>


        {/* ==========================================
        CONTACT INFORMATION
        ========================================== */}

        <section className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-7">

          <h2 className="text-xl font-bold">
            📧 Contact Information
          </h2>

          <p className="text-slate-400 text-sm mt-2">
            Essential contact details detected in your resume.
          </p>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

            <StatusCard
              title="Email"
              status={contactInfo.email}
            />

            <StatusCard
              title="Phone"
              status={contactInfo.phone}
            />

            <StatusCard
              title="LinkedIn"
              status={contactInfo.linkedin}
            />

            <StatusCard
              title="GitHub"
              status={contactInfo.github}
            />

          </div>

        </section>


        {/* ==========================================
        ACTION VERBS
        ========================================== */}

        <section className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-7">

          <div className="flex justify-between items-center">

            <div>

              <h2 className="text-xl font-bold">
                🚀 Action Verbs
              </h2>

              <p className="text-sm text-slate-400 mt-2">
                Strong action-oriented words found in your resume.
              </p>

            </div>


            <div className="text-2xl font-bold text-blue-400">

              {actionVerbs.count || 0}

            </div>

          </div>


          <div className="flex flex-wrap gap-3 mt-6">

            {actionVerbs.verbs?.length > 0 ? (

              actionVerbs.verbs.map(
                (verb: string) => (

                  <span
                    key={verb}
                    className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  >
                    {verb}
                  </span>

                )
              )

            ) : (

              <p className="text-slate-500">
                No strong action verbs detected.
              </p>

            )}

          </div>

        </section>


        {/* ==========================================
        ACHIEVEMENTS
        ========================================== */}

        <section className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-7">

          <div className="flex justify-between">

            <div>

              <h2 className="text-xl font-bold">
                📊 Quantified Achievements
              </h2>

              <p className="text-sm text-slate-400 mt-2">
                Numbers and measurable results detected.
              </p>

            </div>


            <div className="text-2xl font-bold text-green-400">

              {achievements.count || 0}

            </div>

          </div>


          {achievements.count > 0 ? (

            <div className="mt-6">

              <p className="text-sm text-slate-400 mb-3">
                Examples detected:
              </p>

              <div className="flex flex-wrap gap-3">

                {achievements.examples?.map(
                  (
                    example: string,
                    index: number
                  ) => (

                    <span
                      key={index}
                      className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg"
                    >
                      {example}
                    </span>

                  )
                )}

              </div>

            </div>

          ) : (

            <p className="mt-6 text-slate-500">
              Add measurable achievements such as percentages,
              user counts, performance improvements, or revenue impact.
            </p>

          )}

        </section>


        {/* ==========================================
        RESUME LENGTH
        ========================================== */}

        <section className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-7">

          <h2 className="text-xl font-bold">
            📄 Resume Length
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Analysis of your resume content length.
          </p>


          <div className="grid md:grid-cols-2 gap-6 mt-6">

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">

              <p className="text-sm text-slate-400">
                Word Count
              </p>

              <p className="text-3xl font-bold mt-2">

                {resumeLength.word_count || 0}

              </p>

            </div>


            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">

              <p className="text-sm text-slate-400">
                Resume Quality
              </p>

              <p className="text-3xl font-bold mt-2 text-blue-400 capitalize">

                {resumeLength.status || "Unknown"}

              </p>

            </div>

          </div>

        </section>


        {/* ==========================================
        WEAK PHRASES
        ========================================== */}

        <section className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-7">

          <h2 className="text-xl font-bold">
            ⚠️ Weak Phrases
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Phrases that could be replaced with stronger statements.
          </p>


          {weakPhrases.length > 0 ? (

            <div className="flex flex-wrap gap-3 mt-6">

              {weakPhrases.map(
                (phrase: string) => (

                  <span
                    key={phrase}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20"
                  >
                    {phrase}
                  </span>

                )
              )}

            </div>

          ) : (

            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">

              <p className="text-green-400">
                ✓ No major weak phrases detected.
              </p>

            </div>

          )}

        </section>


        {/* ==========================================
        DETECTED SKILLS
        ========================================== */}

        <section className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-7">

          <h2 className="text-xl font-bold">
            🛠 Detected Skills
          </h2>


          <div className="flex flex-wrap gap-3 mt-6">

            {skills.map(
              (skill: string) => (

                <span
                  key={skill}
                  className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg"
                >
                  {skill}
                </span>

              )
            )}

          </div>

        </section>


        {/* ==========================================
        DETECTED SECTIONS
        ========================================== */}

        <section className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-7">

          <h2 className="text-xl font-bold">
            📑 Resume Sections
          </h2>


          <div className="grid md:grid-cols-3 gap-4 mt-6">

            {Object.entries(sections).map(
              ([section, detected]) => (

                <div
                  key={section}
                  className="flex justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl"
                >

                  <span className="capitalize">

                    {section}

                  </span>


                  <span
                    className={
                      detected
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >

                    {detected
                      ? "✓ Detected"
                      : "✕ Missing"
                    }

                  </span>

                </div>

              )
            )}

          </div>

        </section>


        {/* ==========================================
        STRENGTHS
        ========================================== */}

        <section className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-7">

          <h2 className="text-xl font-bold">
            💪 Resume Strengths
          </h2>


          <div className="mt-6 space-y-3">

            {strengths.map(
              (
                strength: string,
                index: number
              ) => (

                <div
                  key={index}
                  className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300"
                >

                  ✓ {strength}

                </div>

              )
            )}

          </div>

        </section>


        {/* ==========================================
        IMPROVEMENTS
        ========================================== */}

        <section className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-7">

          <h2 className="text-xl font-bold">
            🎯 Recommended Improvements
          </h2>


          <div className="mt-6 space-y-3">

            {improvements.map(
              (
                improvement: string,
                index: number
              ) => (

                <div
                  key={index}
                  className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-300"
                >

                  {index + 1}. {improvement}

                </div>

              )
            )}

          </div>

        </section>


        {/* ==========================================
        FEEDBACK
        ========================================== */}

        {resume.feedback && (

          <section className="mt-8 mb-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-7">

            <h2 className="text-xl font-bold text-blue-400">
              AI Feedback
            </h2>

            <p className="text-slate-300 mt-4 leading-relaxed">

              {resume.feedback}

            </p>

          </section>

        )}

      </div>

    </main>

  );

}


// ==========================================
// SCORE CARD COMPONENT
// ==========================================

function ScoreCard({

  title,
  score,

}: {

  title: string;
  score: number;

}) {

  return (

    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

      <p className="text-sm text-slate-400">

        {title}

      </p>

      <p className="text-3xl font-bold text-blue-400 mt-2">

        {Number(score || 0).toFixed(1)}%

      </p>

    </div>

  );

}


// ==========================================
// STATUS CARD COMPONENT
// ==========================================

function StatusCard({

  title,
  status,

}: {

  title: string;
  status: boolean;

}) {

  return (

    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-center">

      <p className="text-sm text-slate-400">

        {title}

      </p>

      <p
        className={
          status
            ? "text-green-400 font-bold mt-2"
            : "text-red-400 font-bold mt-2"
        }
      >

        {status
          ? "✓ Found"
          : "✕ Missing"
        }

      </p>

    </div>

  );

}