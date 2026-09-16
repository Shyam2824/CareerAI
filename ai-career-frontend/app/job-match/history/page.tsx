  "use client";

  import { useEffect, useState } from "react";
  import Link from "next/link";
  import api from "@/services/api";
  import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Eye,
  Trash2,
  Plus,
  Target,
  } from "lucide-react";

  interface JobMatch {
  id: number;
  resume_id: number;
  job_title: string | null;
  company_name: string | null;
  match_score: number;
  created_at: string | null;
  }

  export default function JobMatchHistoryPage() {
  const [history, setHistory] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ==========================================
  // FETCH JOB MATCH HISTORY
  // ==========================================

  const fetchHistory = async () => {
  try {
  setLoading(true);
  setError("");

  
    const response = await api.get<JobMatch[]>(
      "/job-match/history"
    );

    setHistory(response.data);
  } catch (err: unknown) {
    console.error(
      "Failed to load job match history:",
      err
    );

    setError(
      "Failed to load job match history."
    );
  } finally {
    setLoading(false);
  }
  

  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchHistory();
  }, []);

  // ==========================================
  // DELETE JOB MATCH
  // ==========================================

  const handleDelete = async (matchId: number) => {
  const confirmed = window.confirm(
  "Are you sure you want to delete this job match analysis?"
  );


  if (!confirmed) return;

  try {
    setDeletingId(matchId);

    await api.delete("/job-match/" + matchId);

    setHistory((previous) =>
      previous.filter(
        (item) => item.id !== matchId
      )
    );
  } catch (err: unknown) {
    console.error(
      "Failed to delete job match:",
      err
    );

    alert("Failed to delete job match analysis.");
  } finally {
    setDeletingId(null);
  }
 

  };

  // ==========================================
  // SCORE COLOR
  // ==========================================

  const getScoreStyle = (score: number) => {
  if (score >= 80) {
  return "bg-green-500/10 text-green-400 border-green-500/30";
  }

 
  if (score >= 60) {
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  }

  return "bg-red-500/10 text-red-400 border-red-500/30";
  

  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
  return ( <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white"> <div className="text-center"> <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

  ```
        <p className="mt-4 text-slate-400">
          Loading job match history...
        </p>
      </div>
    </main>
  );


  }

  // ==========================================
  // PAGE
  // ==========================================

  return ( <main className="min-h-screen bg-slate-950 text-white"> <div className="mx-auto max-w-7xl px-6 py-10">

  ```
      {/* BACK BUTTON */}
      <Link
        href="/job-match"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={18} />
        Back to Job Match
      </Link>

      {/* HEADER */}
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">
            Job Match History
          </h1>

          <p className="mt-2 text-slate-400">
            Track and review your previous job compatibility analyses.
          </p>
        </div>

        <Link
          href="/job-match"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
        >
          <Plus size={18} />
          New Analysis
        </Link>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* STATS */}
      {history.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Analyses
            </p>

            <p className="mt-2 text-3xl font-bold">
              {history.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Best Match Score
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {Math.max(
                ...history.map((item) =>
                  Number(item.match_score)
                )
              ).toFixed(1)}
              %
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Average Match Score
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {(
                history.reduce(
                  (total, item) =>
                    total + Number(item.match_score),
                  0
                ) / history.length
              ).toFixed(1)}
              %
            </p>
          </div>

        </div>
      )}

      {/* EMPTY STATE */}
      {history.length === 0 && !error && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 py-20 text-center">
          <Target
            size={50}
            className="mx-auto text-blue-400"
          />

          <h2 className="mt-5 text-xl font-semibold">
            No Job Match History
          </h2>

          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Analyze your resume against a job description to start
            tracking your job compatibility.
          </p>

          <Link
            href="/job-match"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
          >
            <Plus size={18} />
            Analyze a Job
          </Link>
        </div>
      )}

      {/* HISTORY TABLE */}
      {history.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead className="border-b border-slate-800 bg-slate-950">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                    Job
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                    Company
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                    Match Score
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                    Date
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-800 transition hover:bg-slate-800/40 last:border-0"
                  >
                    {/* JOB */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/10 p-2">
                          <Briefcase
                            size={18}
                            className="text-blue-400"
                          />
                        </div>

                        <span className="font-medium">
                          {item.job_title ||
                            "Untitled Position"}
                        </span>
                      </div>
                    </td>

                    {/* COMPANY */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Building2 size={16} />

                        {item.company_name ||
                          "Not specified"}
                      </div>
                    </td>

                    {/* SCORE */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${getScoreStyle(
                          Number(item.match_score)
                        )}`}
                      >
                        {Number(
                          item.match_score
                        ).toFixed(1)}
                        %
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-5 text-slate-400">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} />

                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">

                        <Link
                          href={`/job-match/${item.id}`}
                          className="rounded-lg p-2 text-blue-400 transition hover:bg-blue-500/10"
                          title="View Analysis"
                        >
                          <Eye size={19} />
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          disabled={
                            deletingId === item.id
                          }
                          className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                          title="Delete Analysis"
                        >
                          {deletingId === item.id ? (
                            <span>...</span>
                          ) : (
                            <Trash2 size={19} />
                          )}
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

    </div>
  </main>
  

  );
  }
