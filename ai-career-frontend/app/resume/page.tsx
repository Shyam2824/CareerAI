"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import api from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";

function ResumeUploadContent() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      setMessage("Please upload only PDF or DOCX files.");
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setSuccess("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a resume first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setSuccess("");

      const formData = new FormData();

      formData.append("file", file);

      const response = await api.post(
        "/resumes/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload successful:", response.data);

      setSuccess(
        "Resume uploaded and analyzed successfully!"
      );

      setTimeout(() => {
        router.push(
          `/resumes/${response.data.id}`
        );
      }, 1200);

    } catch (error: unknown) {
      console.error("Upload error:", error);

      if (axios.isAxiosError(error)) {
        setMessage(
          error.response?.data?.detail ||
            "Failed to upload resume."
        );
      } else {
        setMessage(
          "Something went wrong. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="border-b border-slate-800">

        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold">
              C
            </div>

            <span className="font-bold text-xl">
              Career
              <span className="text-blue-400">
                AI
              </span>
            </span>
          </button>

          <button
            onClick={() => router.push("/resumes")}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            Resume History
          </button>

        </div>

      </nav>


      {/* MAIN */}
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="text-center">

          <div className="w-16 h-16 mx-auto bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-3xl">
            📄
          </div>

          <h1 className="text-4xl font-bold mt-6">
            Analyze Your Resume
          </h1>

          <p className="text-slate-400 mt-4">
            Upload your resume and get an AI-powered
            analysis of your skills, experience,
            education, and ATS compatibility.
          </p>

        </div>


        {/* UPLOAD CARD */}
        <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
              file
                ? "border-green-500 bg-green-500/5"
                : "border-slate-700 hover:border-blue-500"
            }`}
          >

            <div className="text-5xl">
              {file ? "✅" : "📤"}
            </div>

            {!file ? (
              <>
                <h2 className="text-xl font-semibold mt-5">
                  Upload Your Resume
                </h2>

                <p className="text-slate-400 text-sm mt-2">
                  PDF or DOCX files only
                </p>

                <label
                  htmlFor="resume-upload"
                  className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl cursor-pointer transition"
                >
                  Choose File
                </label>

                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mt-5">
                  File Selected
                </h2>

                <p className="text-green-400 mt-2 break-all">
                  {file.name}
                </p>

                <p className="text-slate-500 text-sm mt-2">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                <button
                  onClick={() => setFile(null)}
                  className="mt-5 text-sm text-red-400 hover:text-red-300"
                >
                  Remove File
                </button>
              </>
            )}

          </div>


          {/* ERROR */}
          {message && (
            <div className="mt-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              ⚠️ {message}
            </div>
          )}


          {/* SUCCESS */}
          {success && (
            <div className="mt-5 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
              ✅ {success}
            </div>
          )}


          {/* BUTTON */}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed rounded-xl font-semibold transition"
          >
            {loading
              ? "Analyzing Resume..."
              : "Upload & Analyze Resume"}
          </button>

        </div>


        {/* FEATURES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">

          <FeatureCard
            icon="📊"
            title="ATS Score"
            description="Check resume compatibility"
          />

          <FeatureCard
            icon="⚡"
            title="Skills"
            description="Analyze your technical skills"
          />

          <FeatureCard
            icon="🤖"
            title="AI Feedback"
            description="Get improvement suggestions"
          />

        </div>

      </div>

    </main>
  );
}


function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

      <div className="text-2xl">
        {icon}
      </div>

      <h3 className="font-semibold mt-3">
        {title}
      </h3>

      <p className="text-xs text-slate-400 mt-2">
        {description}
      </p>

    </div>
  );
}


export default function ResumeUploadPage() {
  return (
    <ProtectedRoute>
      <ResumeUploadContent />
    </ProtectedRoute>
  );
}