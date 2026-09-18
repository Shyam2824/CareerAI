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
  Loader2,
} from "lucide-react";

import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface LoginResponse {
  access_token: string;
  token_type?: string;
}

interface ValidationError {
  msg?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    // Validation
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      /*
       * FastAPI OAuth2PasswordRequestForm expects:
       *
       * username
       * password
       *
       * Content-Type:
       * application/x-www-form-urlencoded
       */

      const formData = new URLSearchParams();

      formData.append("username", normalizedEmail);
      formData.append("password", password);

      const response = await api.post<LoginResponse>(
        "/auth/login",
        formData,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );

      console.log(
        "Login successful:",
        response.data
      );

      const token = response.data?.access_token;

      if (!token) {
        throw new Error(
          "Login succeeded, but no access token was returned by the server."
        );
      }

      /*
       * Save the token immediately.
       *
       * This is important because subsequent requests
       * such as /auth/me, /notifications/summary and
       * /career-report/my require:
       *
       * Authorization: Bearer <token>
       */

      localStorage.setItem(
        "access_token",
        token
      );

      /*
       * Keep compatibility with older code that may
       * still read "token".
       */
      localStorage.setItem("token", token);

      /*
       * Update AuthContext.
       */
      await login(token);

      /*
       * Redirect to dashboard.
       */
      router.replace("/dashboard");
    } catch (err: unknown) {
      console.error(
        "========== LOGIN ERROR =========="
      );

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        console.error("Message:", err.message);
        console.error("Code:", err.code);
        console.error("Status:", status);
        console.error("Response:", data);
        console.error(
          "Request URL:",
          `${err.config?.baseURL || ""}${err.config?.url || ""}`
        );

        /*
         * NETWORK ERROR
         *
         * No HTTP response was received.
         */
        if (
          err.code === "ERR_NETWORK" ||
          err.message === "Network Error"
        ) {
          setError(
            "Unable to connect to CareerAI server. Please make sure the backend is running on https://careerai-6.onrender.com"
          );

          return;
        }

        const detail = data?.detail;

        /*
         * FastAPI validation errors
         */
        if (Array.isArray(detail)) {
          const messages = detail
            .map((item: ValidationError) =>
              typeof item?.msg === "string"
                ? item.msg
                : null
            )
            .filter(
              (message): message is string =>
                Boolean(message)
            );

          setError(
            messages.length > 0
              ? messages.join(", ")
              : "Please check your login information."
          );

          return;
        }

        /*
         * FastAPI normal error
         */
        if (typeof detail === "string") {
          setError(detail);
          return;
        }

        /*
         * HTTP status errors
         */
        if (status === 401) {
          setError(
            "Invalid email or password."
          );
          return;
        }

        if (status === 403) {
          setError(
            "You do not have permission to access this account."
          );
          return;
        }

        if (status === 404) {
          setError(
            "Login service was not found. Please check the backend API URL."
          );
          return;
        }

        if (status === 422) {
          setError(
            "Invalid login request. Please check your email and password."
          );
          return;
        }

        if (status && status >= 500) {
          setError(
            "CareerAI server error. Please try again."
          );
          return;
        }

        setError(
          "Login failed. Please try again."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }

      console.error(
        "================================"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT BRAND PANEL
        ====================================================== */}

        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          {/* Background decoration */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

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
                <p className="text-xl font-bold tracking-tight text-white">
                  CareerAI
                </p>

                <p className="text-xs text-slate-500">
                  AI-Powered Career Platform
                </p>
              </div>
            </Link>

            {/* Main content */}
            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
                <Sparkles
                  size={15}
                  className="text-blue-400"
                />

                AI-powered career growth
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Build the career
                <span className="block text-blue-500">
                  you deserve.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Improve your resume, discover your
                ideal career path, identify skill gaps,
                prepare for interviews, and connect
                with industry mentors.
              </p>

              {/* Features */}
              <div className="mt-10 space-y-5">

                <Feature
                  icon={<CheckCircle2 size={19} />}
                  title="AI Resume Intelligence"
                  description="Analyze and improve your resume for better opportunities."
                />

                <Feature
                  icon={<BriefcaseBusiness size={19} />}
                  title="Career Intelligence"
                  description="Get personalized career paths and learning roadmaps."
                />

                <Feature
                  icon={<ShieldCheck size={19} />}
                  title="Secure & Private"
                  description="Your career data is protected with secure authentication."
                />

              </div>
            </div>

            {/* Footer */}
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} CareerAI.
              All rights reserved.
            </p>
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN PANEL
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

              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <LockKeyhole
                  size={23}
                  className="text-blue-600"
                />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to continue your CareerAI
                journey.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <span className="text-xs font-bold text-red-600">
                      !
                    </span>
                  </div>

                  <p className="text-sm leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      // Reserved for future forgot-password flow
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>

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
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember / Security */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck
                  size={15}
                  className="text-emerald-500"
                />

                <span>
                  Your connection is protected.
                </span>
              </div>

              {/* Submit */}
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

                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs text-slate-400">
                New to CareerAI?
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Register */}
            <Link
              href="/register"
              className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
            >
              Create your account
            </Link>

            {/* Terms */}
            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to CareerAI&apos;s{" "}
              <Link
                href="/terms"
                className="text-slate-600 hover:text-blue-600"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-slate-600 hover:text-blue-600"
              >
                Privacy Policy
              </Link>
              .
            </p>
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