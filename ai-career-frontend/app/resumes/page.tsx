"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import api from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";


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


function ResumeHistoryContent() {
  const router = useRouter();

  const [resumes, setResumes] =
    useState<Resume[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");


  useEffect(() => {

    const fetchResumes = async () => {

      try {

        setLoading(true);

        const response =
          await api.get<Resume[]>(
            "/resumes/"
          );

        setResumes(response.data);

      } catch (error: unknown) {

        if (axios.isAxiosError(error)) {

          setMessage(
            error.response?.data?.detail ||
              "Failed to load resume history."
          );

        } else {

          setMessage(
            "Something went wrong."
          );

        }

      } finally {

        setLoading(false);

      }

    };

    fetchResumes();

  }, []);


  const formatDate = (
    date: string | null
  ) => {

    if (!date) return "Unknown";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  if (loading) {

    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Loading resumes...
          </p>

        </div>

      </main>
    );
  }


  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="border-b border-slate-800">

        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="font-bold text-xl"
          >
            Career
            <span className="text-blue-400">
              AI
            </span>
          </button>

          <button
            onClick={() =>
              router.push("/resume")
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
          >
            + Upload Resume
          </button>

        </div>

      </nav>


      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex justify-between items-center mb-10">

          <div>

            <p className="text-blue-400 text-sm">
              RESUME HISTORY
            </p>

            <h1 className="text-4xl font-bold mt-2">
              Your Resume Analysis
            </h1>

            <p className="text-slate-400 mt-3">
              Track all your resume analyses.
            </p>

          </div>

          <div className="text-right">

            <p className="text-slate-500 text-sm">
              Total Resumes
            </p>

            <p className="text-3xl font-bold text-blue-400">
              {resumes.length}
            </p>

          </div>

        </div>


        {/* ERROR */}
        {message && (

          <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {message}
          </div>

        )}


        {/* EMPTY */}
        {!message &&
          resumes.length === 0 && (

            <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-16">

              <div className="text-5xl">
                📄
              </div>

              <h2 className="text-2xl font-bold mt-5">
                No Resumes Yet
              </h2>

              <p className="text-slate-400 mt-3">
                Upload your first resume to get started.
              </p>

              <button
                onClick={() =>
                  router.push("/resume")
                }
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl"
              >
                Upload Resume
              </button>

            </div>

          )}


        {/* RESUME LIST */}
        <div className="space-y-5">

          {resumes.map((resume) => (

            <div
              key={resume.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >

              <div className="flex flex-col lg:flex-row justify-between gap-6">

                {/* FILE INFO */}
                <div>

                  <div className="flex items-center gap-3">

                    <div className="text-3xl">
                      📄
                    </div>

                    <div>

                      <h2 className="text-xl font-semibold">
                        {resume.file_name}
                      </h2>

                      <p className="text-sm text-slate-400 mt-1">
                        Analyzed on{" "}
                        {formatDate(
                          resume.created_at
                        )}
                      </p>

                    </div>

                  </div>


                  {/* FEEDBACK */}
                  {resume.feedback && (

                    <div className="mt-5 text-sm text-slate-400 max-w-xl">

                      🤖 {resume.feedback}

                    </div>

                  )}

                </div>


                {/* SCORES */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                  <ScoreCard
                    title="ATS"
                    score={resume.ats_score}
                  />

                  <ScoreCard
                    title="Skills"
                    score={resume.skills_score}
                  />

                  <ScoreCard
                    title="Experience"
                    score={
                      resume.experience_score
                    }
                  />

                  <ScoreCard
                    title="Education"
                    score={
                      resume.education_score
                    }
                  />

                </div>

              </div>


              {/* ACTION */}
              <div className="mt-6 pt-5 border-t border-slate-800 flex justify-end">

                <button
                  onClick={() =>
                    router.push(
                      `/resumes/${resume.id}`
                    )
                  }
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
                >
                  View Full Analysis →
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}


function ScoreCard({
  title,
  score,
}: {
  title: string;
  score: number;
}) {

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center min-w-22.5">

      <p className="text-xl font-bold text-blue-400">
        {Number(score).toFixed(0)}
      </p>

      <p className="text-xs text-slate-500 mt-1">
        {title}
      </p>

    </div>
  );
}


export default function ResumeHistoryPage() {
  return (
    <ProtectedRoute>
      <ResumeHistoryContent />
    </ProtectedRoute>
  );
}