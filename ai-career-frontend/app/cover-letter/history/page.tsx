"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import api from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";

interface CoverLetterHistory {
  id: number;
  resume_id?: number | null;
  job_title?: string | null;
  company_name?: string | null;
  tone: string;
  created_at: string;
}

export default function CoverLetterHistoryPage() {
  const router = useRouter();

  const [coverLetters, setCoverLetters] = useState<
    CoverLetterHistory[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );

  const [error, setError] = useState("");

  // ========================================================
  // LOAD HISTORY
  // ========================================================

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/cover-letter/history"
      );

      setCoverLetters(response.data);
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Unable to load cover letter history."
        );
      } else {
        setError(
          "Unable to load cover letter history."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // LOAD ON PAGE OPEN
  // ========================================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory();
  }, []);

  // ========================================================
  // DELETE COVER LETTER
  // ========================================================

  const deleteCoverLetter = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this cover letter?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await api.delete(
        `/cover-letter/${id}`
      );

      setCoverLetters((previous) =>
        previous.filter(
          (coverLetter) =>
            coverLetter.id !== id
        )
      );
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Unable to delete cover letter."
        );
      } else {
        setError(
          "Unable to delete cover letter."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================================
  // OPEN COVER LETTER
  // ========================================================

  const openCoverLetter = (id: number) => {
    router.push(
      `/cover-letter?id=${id}`
    );
  };

  // ========================================================
  // FORMAT DATE
  // ========================================================

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  };

  // ========================================================
  // UI
  // ========================================================

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Cover Letter History
              </h1>

              <p className="mt-2 text-slate-600">
                View and manage your previously generated
                cover letters.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/cover-letter")
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
            >
              + Create Cover Letter
            </button>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <div className="text-slate-500">
                Loading cover letters...
              </div>
            </div>
          ) : coverLetters.length === 0 ? (

            /* ==================================================
                EMPTY STATE
            ================================================== */

            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <div className="mb-4 text-6xl">
                ✉️
              </div>

              <h2 className="text-xl font-semibold text-slate-900">
                No Cover Letters Yet
              </h2>

              <p className="mt-2 text-slate-500">
                Generate your first personalized cover letter
                to see it here.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/cover-letter")
                }
                className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Create Your First Cover Letter
              </button>
            </div>

          ) : (

            /* ==================================================
                HISTORY LIST
            ================================================== */

            <div className="space-y-4">

              {coverLetters.map((coverLetter) => (

                <div
                  key={coverLetter.id}
                  className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* ========================================
                        INFORMATION
                    ======================================== */}

                    <div className="min-w-0">

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                          ✉️
                        </div>

                        <div className="min-w-0">

                          <h2 className="truncate text-lg font-semibold text-slate-900">
                            {coverLetter.job_title ||
                              "Cover Letter"}
                          </h2>

                          <p className="mt-1 text-slate-600">
                            {coverLetter.company_name ||
                              "Company not specified"}
                          </p>

                        </div>
                      </div>

                      {/* ======================================
                          META
                      ====================================== */}

                      <div className="mt-4 flex flex-wrap gap-2">

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                          {coverLetter.tone}
                        </span>

                        {coverLetter.resume_id && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            Resume #{coverLetter.resume_id}
                          </span>
                        )}

                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          {formatDate(
                            coverLetter.created_at
                          )}
                        </span>

                      </div>
                    </div>

                    {/* ========================================
                        ACTIONS
                    ======================================== */}

                    <div className="flex flex-wrap gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          openCoverLetter(
                            coverLetter.id
                          )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Open
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteCoverLetter(
                            coverLetter.id
                          )
                        }
                        disabled={
                          deletingId ===
                          coverLetter.id
                        }
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId ===
                        coverLetter.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}