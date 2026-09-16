
"use client";

import {Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import VoiceInterview from "@/components/VoiceInterview";
import  api  from "@/services/api";

type Question = {
  id: number;
  interview_id: number;
  question: string;
  category?: string | null;
  topic?: string | null;
  difficulty: string;
  question_type: string;
  expected_answer?: string | null;
  candidate_answer?: string | null;
  score?: number | null;
  feedback?: string | null;
  question_order: number;
  status: string;
  created_at: string;
};

type Interview = {
  id: number;
  resume_id?: number | null;
  job_title?: string | null;
  company_name?: string | null;
  interview_type: string;
  difficulty: string;
  total_questions: number;
  completed_questions: number;
  overall_score: number;
  status: string;
};

type AnswerSource = "text" | "voice";

function InterviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const interviewId = searchParams.get("id");

  const [interview, setInterview] =
    useState<Interview | null>(null);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answer, setAnswer] =
    useState("");

  const [answerSource, setAnswerSource] =
    useState<AnswerSource>("text");

  const [answerDuration, setAnswerDuration] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [creatingInterview, setCreatingInterview] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showFeedback, setShowFeedback] =
    useState(false);

  // Prevent duplicate interview creation
  // during React development Strict Mode.
  const creationStarted = useRef(false);

  // ==========================================================
  // ERROR FORMATTER
  // ==========================================================

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        return detail;
      }

      if (Array.isArray(detail)) {
        return detail
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
          .join(", ");
      }

      if (
        typeof detail === "object" &&
        detail !== null &&
        "msg" in detail
      ) {
        return String(
          (detail as { msg?: unknown }).msg ??
            fallback
        );
      }

      if (err.response?.status) {
        return `${fallback} (${err.response.status})`;
      }
    }

    if (err instanceof Error) {
      return err.message;
    }

    return fallback;
  };

  // ==========================================================
  // CREATE NEW INTERVIEW
  // ==========================================================

  const createInterview = async () => {
    try {
      setCreatingInterview(true);
      setLoading(true);
      setError("");

      /*
       * Create a new interview.
       *
       * The interview can later be associated with
       * a resume/job description.
       */
      const response = await api.post<Interview>(
        "/interviews/",
        {
          interview_type: "technical",
          difficulty: "medium",
          job_title: "Data Scientist",
          company_name: "",
        }
      );

      const createdInterview = response.data;

      if (
        !createdInterview ||
        !Number.isInteger(createdInterview.id) ||
        createdInterview.id <= 0
      ) {
        throw new Error(
          "Interview was created but no valid interview ID was returned."
        );
      }

      /*
       * Put the REAL database ID into the URL.
       *
       * Example:
       * /interview?id=7
       */
      router.replace(
        `/interview?id=${createdInterview.id}`
      );
    } catch (err: unknown) {
      console.error(
        "Failed to create interview:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to create a new interview."
        )
      );

      setLoading(false);
      setCreatingInterview(false);
    }
  };

  // ==========================================================
  // LOAD INTERVIEW
  // ==========================================================

  useEffect(() => {
    /*
     * IMPORTANT:
     *
     * /interview
     *     ↓
     * create interview
     *     ↓
     * /interview?id=REAL_ID
     *
     * Therefore we don't show
     * "Interview ID is missing".
     */
    if (!interviewId) {
      if (!creationStarted.current) {
        creationStarted.current = true;
        createInterview();
      }

      return;
    }

    const id = Number(interviewId);

    if (!Number.isInteger(id) || id <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(
        `Invalid interview ID: ${interviewId}`
      );
      setLoading(false);
      return;
    }

    // eslint-disable-next-line react-hooks/immutability
    loadInterview(id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  // ==========================================================
  // LOAD INTERVIEW DATA
  // ==========================================================

  const loadInterview = async (id: number) => {
    try {
      setLoading(true);
      setError("");

      // ------------------------------------------------------
      // Load interview
      // ------------------------------------------------------

      const interviewResponse =
        await api.get<Interview>(
          `/interviews/${id}`
        );

      setInterview(interviewResponse.data);

      // ------------------------------------------------------
      // Load questions
      // ------------------------------------------------------

      const questionsResponse =
        await api.get<Question[]>(
          `/interviews/${id}/questions`
        );

      let loadedQuestions =
        questionsResponse.data || [];

      // ------------------------------------------------------
      // Generate questions if none exist
      // ------------------------------------------------------

      if (loadedQuestions.length === 0) {
        setGenerating(true);

        try {
          const generateResponse =
            await api.post<Question[]>(
              `/interviews/${id}/generate-questions`
            );

          loadedQuestions =
            generateResponse.data || [];
        } finally {
          setGenerating(false);
        }
      }

      setQuestions(loadedQuestions);

      // ------------------------------------------------------
      // Find first unanswered question
      // ------------------------------------------------------

      if (loadedQuestions.length > 0) {
        const unansweredIndex =
          loadedQuestions.findIndex(
            (question) =>
              question.status !== "answered"
          );

        if (unansweredIndex >= 0) {
          setCurrentIndex(
            unansweredIndex
          );
        } else {
          setCurrentIndex(
            loadedQuestions.length - 1
          );
        }
      }

      // ------------------------------------------------------
      // Reset answer state
      // ------------------------------------------------------

      setAnswer("");
      setAnswerSource("text");
      setAnswerDuration(0);
      setShowFeedback(false);
    } catch (err: unknown) {
      console.error(
        "Unable to load interview:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load interview."
        )
      );
    } finally {
      setLoading(false);
      setGenerating(false);
      setCreatingInterview(false);
    }
  };

  // ==========================================================
  // CURRENT QUESTION
  // ==========================================================

  const currentQuestion =
    questions[currentIndex];

  // ==========================================================
  // SUBMIT ANSWER
  // ==========================================================

  const submitAnswer = async () => {
    if (!currentQuestion) {
      return;
    }

    if (!answer.trim()) {
      setError(
        "Please enter your answer."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response =
        await api.post<Question>(
          `/interviews/${currentQuestion.interview_id}/questions/${currentQuestion.id}/answer`,
          {
            candidate_answer:
              answer.trim(),

            answer_source:
              answerSource,

            answer_duration_seconds:
              answerDuration,
          }
        );

      const updatedQuestion =
        response.data;

      setQuestions((previous) =>
        previous.map((question) =>
          question.id ===
          updatedQuestion.id
            ? updatedQuestion
            : question
        )
      );

      setShowFeedback(true);
    } catch (err: unknown) {
      console.error(
        "Unable to submit answer:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to submit answer."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // NEXT QUESTION
  // ==========================================================

  const nextQuestion = () => {
    const isLastQuestion =
      currentIndex ===
      questions.length - 1;

    // --------------------------------------------------------
    // Last question → Result
    // --------------------------------------------------------

    if (isLastQuestion) {
      const id =
        interview?.id ||
        Number(interviewId);

      if (
        Number.isInteger(id) &&
        id > 0
      ) {
        router.push(
          `/interview/result?id=${id}`
        );
      } else {
        setError(
          "Unable to determine interview ID."
        );
      }

      return;
    }

    // --------------------------------------------------------
    // Next question
    // --------------------------------------------------------

    setCurrentIndex(
      (previous) =>
        previous + 1
    );

    setAnswer("");
    setAnswerSource("text");
    setAnswerDuration(0);
    setShowFeedback(false);
    setError("");
  };

  // ==========================================================
  // EXIT
  // ==========================================================

  const exitInterview = () => {
    router.push("/dashboard");
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading ||
    generating ||
    creatingInterview
  ) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-6">

          <div className="w-10 h-10 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <h2 className="text-xl font-semibold text-slate-800">
            {creatingInterview
              ? "Creating your interview..."
              : generating
              ? "Generating your interview questions..."
              : "Loading interview..."}
          </h2>

          <p className="text-slate-500 mt-2">
            Please wait.
          </p>

        </div>
      </main>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    !currentQuestion
  ) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 max-w-lg w-full text-center">

          <h2 className="text-xl font-bold text-red-600">
            Interview Error
          </h2>

          <p className="text-slate-600 mt-3">
            {String(error)}
          </p>

          <div className="mt-6 flex justify-center gap-3">

            <button
              onClick={() =>
                router.push("/dashboard")
              }
              className="px-5 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Back to Dashboard
            </button>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================================
  // NO QUESTIONS
  // ==========================================================

  if (!currentQuestion) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

        <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-lg w-full text-center">

          <h2 className="text-2xl font-bold text-slate-900">
            No interview questions found
          </h2>

          <p className="mt-3 text-slate-500">
            We could not generate questions for this interview.
          </p>

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="mt-5 px-5 py-2.5 bg-slate-900 text-white rounded-lg"
          >
            Back to Dashboard
          </button>

        </div>

      </main>
    );
  }

  // ==========================================================
  // QUESTION STATE
  // ==========================================================

  const answered =
    currentQuestion.status ===
    "answered";

  const isLastQuestion =
    currentIndex ===
    questions.length - 1;

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b">

        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              AI Mock Interview
            </h1>

            <p className="text-sm text-slate-500 mt-1">

              {interview?.job_title ||
                "Interview Practice"}

              {interview?.company_name
                ? ` • ${interview.company_name}`
                : ""}

            </p>

            <p className="text-xs text-slate-400 mt-1">
              Interview ID:{" "}
              {interview?.id}
            </p>

          </div>

          <button
            onClick={exitInterview}
            className="px-4 py-2 rounded-lg border text-slate-700 hover:bg-slate-50"
          >
            Exit
          </button>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="max-w-4xl mx-auto px-6 py-10">

        {/* Progress */}

        <div className="mb-8">

          <div className="flex justify-between text-sm mb-2">

            <span className="font-medium text-slate-700">

              Question{" "}
              {currentIndex + 1}{" "}
              of{" "}
              {questions.length}

            </span>

            <span className="text-slate-500">

              {interview?.completed_questions || 0}
              {" "}answered

            </span>

          </div>

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">

            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: `${
                  ((currentIndex + 1) /
                    questions.length) *
                  100
                }%`,
              }}
            />

          </div>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
            {String(error)}
          </div>
        )}

        {/* =================================================
            QUESTION CARD
        ================================================= */}

        <div className="bg-white rounded-2xl border shadow-sm p-8">

          {/* Tags */}

          <div className="flex flex-wrap gap-2 mb-5">

            {currentQuestion.category && (
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                {currentQuestion.category}
              </span>
            )}

            {currentQuestion.topic && (
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                {currentQuestion.topic}
              </span>
            )}

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
              {currentQuestion.difficulty}
            </span>

          </div>

          {/* Question */}

          <h2 className="text-2xl font-semibold text-slate-900 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* =================================================
              ANSWER
          ================================================= */}

          <div className="mt-8">

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Answer
            </label>

            <textarea
              value={
                answered
                  ? currentQuestion.candidate_answer ||
                    ""
                  : answer
              }
              onChange={(event) => {
                setAnswer(
                  event.target.value
                );

                setAnswerSource(
                  "text"
                );

                setAnswerDuration(
                  0
                );
              }}
              disabled={
                answered ||
                submitting
              }
              rows={8}
              placeholder="Type your answer here..."
              className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-slate-100"
            />

            {/* =================================================
                VOICE INTERVIEW
            ================================================= */}

            {!answered && (
              <VoiceInterview
                question={
                  currentQuestion.question
                }
                disabled={
                  submitting ||
                  generating
                }
                onAnswer={(
                  voiceAnswer,
                  duration
                ) => {
                  setAnswer(
                    voiceAnswer
                  );

                  setAnswerSource(
                    "voice"
                  );

                  setAnswerDuration(
                    duration
                  );

                  setError("");
                }}
              />
            )}

            {/* Answer source */}

            {!answered && answer && (
              <div className="mt-3 text-xs text-slate-500">
                Answer source:{" "}
                <span className="font-semibold">
                  {answerSource ===
                  "voice"
                    ? "Voice"
                    : "Text"}
                </span>

                {answerSource ===
                  "voice" &&
                  answerDuration >
                    0 && (
                    <>
                      {" "}•{" "}
                      {answerDuration}s
                    </>
                  )}
              </div>
            )}

          </div>

          {/* =================================================
              SUBMIT BUTTON
          ================================================= */}

          {!answered &&
            !showFeedback && (
              <button
                onClick={
                  submitAnswer
                }
                disabled={
                  submitting ||
                  !answer.trim()
                }
                className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Evaluating Answer..."
                  : "Submit Answer"}
              </button>
            )}

          {/* =================================================
              FEEDBACK
          ================================================= */}

          {showFeedback &&
            currentQuestion.score !==
              null &&
            currentQuestion.score !==
              undefined && (

              <div className="mt-8 border-t pt-8">

                <div className="flex items-center justify-between">

                  <h3 className="text-lg font-bold text-slate-900">
                    AI Evaluation
                  </h3>

                  <div className="text-3xl font-bold text-blue-600">

                    {currentQuestion.score}

                    <span className="text-base text-slate-400">
                      /100
                    </span>

                  </div>

                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-5">

                  <p className="text-slate-700 leading-relaxed">
                    {currentQuestion.feedback ||
                      "No feedback available."}
                  </p>

                </div>

                <button
                  onClick={
                    nextQuestion
                  }
                  className="mt-6 w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  {isLastQuestion
                    ? "View Interview Result"
                    : "Next Question"}
                </button>

              </div>
            )}

          {/* =================================================
              ALREADY ANSWERED
          ================================================= */}

          {answered &&
            !showFeedback && (
              <div className="mt-8 border-t pt-8">

                <div className="rounded-xl bg-green-50 border border-green-200 p-5">

                  <p className="font-semibold text-green-700">
                    Answer already submitted
                  </p>

                  <p className="mt-2 text-sm text-green-600">
                    Score:{" "}
                    {currentQuestion.score ??
                      0}
                    /100
                  </p>

                  {currentQuestion.feedback && (
                    <p className="mt-3 text-sm text-green-700">
                      {currentQuestion.feedback}
                    </p>
                  )}

                </div>

                <button
                  onClick={
                    nextQuestion
                  }
                  className="mt-6 w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  {isLastQuestion
                    ? "View Interview Result"
                    : "Next Question"}
                </button>

              </div>
            )}

        </div>

      </section>

    </main>
  );
}

function InterviewLoading() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">
          Loading interview...
        </h2>
        <p className="text-slate-500 mt-2">Please wait.</p>
      </div>
    </main>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<InterviewLoading />}>
      <InterviewPageContent />
    </Suspense>
  );
}
