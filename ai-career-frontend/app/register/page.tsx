"use client";

import type { FormEvent } from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Loader2,
} from "lucide-react";

import api from "@/services/api";

interface RegisterResponse {
  id?: number;
  name?: string;
  email?: string;
  message?: string;
}

interface ValidationError {
  msg?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // -------------------------
    // Validation
    // -------------------------

    if (!cleanName) {
      setMessage("Please enter your full name.");
      return;
    }

    if (cleanName.length < 2) {
      setMessage(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (!cleanEmail) {
      setMessage(
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      setMessage("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      // -------------------------
      // Register user
      // -------------------------

      const response =
        await api.post<RegisterResponse>(
          "/auth/register",
          {
            name: cleanName,
            email: cleanEmail,
            password,
          }
        );

      console.log(
        "Registration successful:",
        response.data
      );

      setSuccess(true);

      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error: unknown) {
      // -------------------------
      // Error handling
      // -------------------------

      console.error(
        "Registration error:",
        error
      );

      if (axios.isAxiosError(error)) {
        const status =
          error.response?.status;

        const data =
          error.response?.data;

        console.error(
          "Registration status:",
          status
        );

        console.error(
          "Registration response:",
          data
        );

        console.error(
          "Registration URL:",
          error.config?.url
        );

        // Network error
        if (
          error.code === "ERR_NETWORK" ||
          error.message === "Network Error"
        ) {
          setMessage(
            "Unable to connect to the CareerAI server. Please make sure the backend is running on https://careerai-6.onrender.com/"
          );

          return;
        }

        const detail = data?.detail;

        // FastAPI validation error
        if (Array.isArray(detail)) {
          const messages = detail
            .map((item: ValidationError) => {
              if (
                typeof item?.msg === "string"
              ) {
                return item.msg;
              }

              return null;
            })
            .filter(
              (
                item
              ): item is string =>
                Boolean(item)
            );

          setMessage(
            messages.length > 0
              ? messages.join(", ")
              : "Please check the information you entered."
          );

          return;
        }

        // Normal FastAPI error
        if (
          typeof detail === "string"
        ) {
          setMessage(detail);
          return;
        }

        // HTTP errors
        if (status === 400) {
          setMessage(
            "Invalid registration details."
          );
          return;
        }

        if (status === 409) {
          setMessage(
            "An account with this email already exists."
          );
          return;
        }

        if (status === 422) {
          setMessage(
            "Please check your name, email, and password."
          );
          return;
        }

        if (
          status &&
          status >= 500
        ) {
          setMessage(
            "CareerAI server error. Please try again later."
          );
          return;
        }

        setMessage(
          "Registration failed. Please try again."
        );
      } else if (
        error instanceof Error
      ) {
        setMessage(error.message);
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
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">

          {/* Background effects */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

          <div className="absolute right-20 top-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}
            <Link
              href="/"
              className="flex w-fit items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                <Sparkles
                  size={23}
                  className="text-white"
                />
              </div>

              <div>
                <p className="text-xl font-bold text-white">
                  CareerAI
                </p>

                <p className="text-xs text-slate-500">
                  AI-Powered Career Platform
                </p>
              </div>
            </Link>

            {/* Hero */}
            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
                <Sparkles
                  size={15}
                  className="text-blue-400"
                />

                AI-powered career intelligence
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Build the career
                <span className="block text-blue-500">
                  you deserve.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Improve your resume, discover
                career opportunities, identify
                skill gaps, prepare for interviews,
                and connect with industry mentors.
              </p>

              {/* Features */}
              <div className="mt-10 space-y-5">

                <Feature
                  icon={
                    <CheckCircle2 size={19} />
                  }
                  title="AI Resume Intelligence"
                  description="Analyze and improve your resume for better opportunities."
                />

                <Feature
                  icon={
                    <BriefcaseBusiness
                      size={19}
                    />
                  }
                  title="Career Intelligence"
                  description="Get personalized career paths and learning roadmaps."
                />

                <Feature
                  icon={
                    <ShieldCheck size={19} />
                  }
                  title="Secure & Private"
                  description="Your professional information is protected."
                />

              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-3">

                <Stat
                  value="AI"
                  label="Resume"
                />

                <Stat
                  value="ATS"
                  label="Optimization"
                />

                <Stat
                  value="1:1"
                  label="Mentorship"
                />

              </div>
            </div>

            {/* Footer */}
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} CareerAI.
              AI-powered career growth.
            </p>

          </div>
        </section>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-10 flex justify-center lg:hidden">
              <Link
                href="/"
                className="flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                  <Sparkles
                    size={22}
                    className="text-white"
                  />
                </div>

                <span className="text-xl font-bold text-slate-900">
                  CareerAI
                </span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <User
                  size={23}
                  className="text-blue-600"
                />
              </div>

              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                Start your journey
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Join CareerAI and take control
                of your professional future.
              </p>

            </div>

            {/* Message */}
            {message && (
              <div
                role="alert"
                className={`mb-6 rounded-xl border p-4 ${
                  success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <div className="flex items-start gap-3">

                  {success ? (
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                  ) : (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <span className="text-xs font-bold text-red-600">
                        !
                      </span>
                    </div>
                  )}

                  <p className="text-sm leading-5">
                    {message}
                  </p>

                </div>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleRegister}
              className="space-y-5"
            >

              {/* Name */}
              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <div className="relative">

                  <User
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      setName(
                        e.target.value
                      );
                      setMessage("");
                    }}
                    disabled={loading}
                    required
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                </div>
              </div>

              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(
                        e.target.value
                      );
                      setMessage("");
                    }}
                    disabled={loading}
                    required
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                </div>
              </div>

              {/* Password */}
              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(
                        e.target.value
                      );
                      setMessage("");
                    }}
                    disabled={loading}
                    required
                    minLength={6}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck
                    size={14}
                    className="text-emerald-500"
                  />

                  Minimum 6 characters
                </div>

              </div>

              {/* Terms */}
              <p className="text-xs leading-5 text-slate-500">
                By creating an account, you agree
                to CareerAI&apos;s{" "}
                <Link
                  href="/terms"
                  className="font-medium text-slate-700 hover:text-blue-600"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-slate-700 hover:text-blue-600"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Creating account...
                  </>
                ) : (
                  <>
                    Create account

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

            </form>

            {/* Login */}
            <div className="mt-8 text-center text-sm text-slate-500">

              Already have an account?{" "}

              <Link
                href="/login"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Sign in
              </Link>

            </div>

            {/* Security */}
            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck
                size={14}
                className="text-emerald-500"
              />

              Secure account registration
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   FEATURE COMPONENT
============================================================ */

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-blue-400">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
}

/* ============================================================
   STAT COMPONENT
============================================================ */

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-lg font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
}