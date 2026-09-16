"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Upload,
  FileText,
  Loader2,
  X,
  Lock,
  CheckCircle,
} from "lucide-react";

import api  from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function ResumeUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { user, loading: authLoading } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Resume ID returned by backend after analysis
  const [resumeId, setResumeId] = useState<number | null>(null);

  // Analysis completed
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // ============================================================
  // SELECT FILE
  // ============================================================

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setError("");
    setAnalysisComplete(false);
    setResumeId(null);

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOC, or DOCX resume.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Resume file must be less than 10 MB.");
      return;
    }

    setFile(selectedFile);
  };

  // ============================================================
  // OPEN FILE PICKER
  // IMPORTANT: NO LOGIN CHECK HERE
  // ============================================================

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // ============================================================
  // REMOVE FILE
  // ============================================================

  const removeFile = () => {
    setFile(null);
    setResumeId(null);
    setAnalysisComplete(false);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // UPLOAD + ANALYZE
  // ============================================================

  const uploadResume = async () => {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setAnalysisComplete(false);

      const formData = new FormData();
      formData.append("file", file);

      /*
       * IMPORTANT
       *
       * We are NOT checking user here.
       *
       * Resume upload + initial analysis is allowed
       * before login.
       */

      const response = await api.post(
        "/resumes/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const returnedResumeId =
        response.data?.id ??
        response.data?.resume_id;

      if (!returnedResumeId) {
        throw new Error(
          "Resume analyzed, but resume ID was not returned."
        );
      }

      // Save resume ID
      setResumeId(Number(returnedResumeId));

      // Analysis completed
      setAnalysisComplete(true);

      /*
       * DO NOT redirect here.
       *
       * Previously:
       *
       * router.push(`/resume/${resumeId}`);
       *
       * That immediately opened the analysis page.
       *
       * Now we stay here and ask the user to login
       * before viewing the complete analysis.
       */
    } catch (err: unknown) {
      console.error("Resume upload error:", err);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail;

        if (status === 401) {
          /*
           * If your backend currently requires JWT for
           * /resumes/upload, this frontend cannot bypass it.
           *
           * In that case backend /resumes/upload must be
           * changed to allow anonymous upload/analysis.
           */
          setError(
            "Resume analysis requires backend anonymous-upload access."
          );
          return;
        }

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
          setError("Unable to analyze resume.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to analyze resume.");
      }
    } finally {
      setUploading(false);
    }
  };

  // ============================================================
  // VIEW FULL ANALYSIS
  // ============================================================

  const handleViewAnalysis = () => {
    if (!resumeId) {
      setError("Resume analysis is not available.");
      return;
    }

    /*
     * NOT LOGGED IN
     *
     * Send user to login.
     *
     * After login, login page should redirect to:
     *
     * /resume/{resumeId}
     */

    if (!user) {
      router.push(
        `/login?redirect=/resume/${resumeId}`
      );

      return;
    }

    /*
     * LOGGED IN
     *
     * Open full analysis.
     */

    router.push(`/resume/${resumeId}`);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Upload
              size={28}
              className="text-blue-600"
            />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Upload Your Resume
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Upload your resume to get your ATS score,
            skill analysis, and improvement suggestions.
          </p>
        </div>

        {/* ======================================================
            HIDDEN FILE INPUT
        ====================================================== */}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* ======================================================
            AUTH CHECKING
        ====================================================== */}

        {authLoading && (
          <div className="mt-6 flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
            <Loader2
              size={18}
              className="animate-spin"
            />
            Checking account...
          </div>
        )}

        {/* ======================================================
            SELECT RESUME
            LOGIN IS NOT REQUIRED
        ====================================================== */}

        {!file && !analysisComplete && (
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading}
            className="mt-6 w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload
              size={30}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 font-semibold text-slate-700">
              Click to choose your resume
            </p>

            <p className="mt-1 text-sm text-slate-500">
              PDF, DOC or DOCX • Maximum 10 MB
            </p>

            <p className="mt-3 text-xs text-slate-400">
              No login required to analyze your resume
            </p>
          </button>
        )}

        {/* ======================================================
            SELECTED FILE
        ====================================================== */}

        {file && !analysisComplete && (
          <>
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <FileText
                      size={22}
                      className="text-blue-600"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">
                      {file.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={uploading}
                  className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-600 disabled:opacity-50"
                >
                  <X size={20} />
                </button>

              </div>
            </div>

            {/* ==================================================
                ANALYZE BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={uploadResume}
              disabled={uploading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload & Analyze Resume
                </>
              )}
            </button>
          </>
        )}

        {/* ======================================================
            ANALYSIS COMPLETE
        ====================================================== */}

        {analysisComplete && resumeId && (
          <div className="mt-6">

            <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">

              <CheckCircle
                size={42}
                className="mx-auto text-green-600"
              />

              <h3 className="mt-3 text-lg font-bold text-slate-900">
                Resume Analyzed Successfully
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Your ATS analysis is ready.
              </p>

              {/* =================================================
                  LOGIN MESSAGE
              ================================================= */}

              {!user ? (
                <>
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">

                    <Lock
                      size={22}
                      className="mx-auto text-blue-600"
                    />

                    <p className="mt-2 text-sm font-medium text-slate-800">
                      Login or Sign Up to View Your Analysis
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Your resume has already been analyzed.
                      Login to access your complete ATS score,
                      skills, feedback, and recommendations.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={handleViewAnalysis}
                    className="mt-4 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Login / Sign Up & View Analysis
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm text-green-700">
                    Your analysis is ready to view.
                  </p>

                  <button
                    type="button"
                    onClick={handleViewAnalysis}
                    className="mt-4 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    View ATS Analysis
                  </button>
                </>
              )}

              {/* Analyze another resume */}

              <button
                type="button"
                onClick={removeFile}
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                Analyze Another Resume
              </button>

            </div>
          </div>
        )}

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {String(error)}
          </div>
        )}

      </div>
    </div>
  );
}