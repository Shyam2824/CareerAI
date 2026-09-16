"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import api from "@/services/api";
import {
  getApiErrorMessage,
} from "@/services/apiError";

/* ============================================================================
   Mentor Login Page
   Phase 22.4.5
   ============================================================================ */

export default function MentorLoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ==========================================================================
     Submit Login
     ========================================================================== */

  const submit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Prevent duplicate requests
    if (loading) {
      return;
    }

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    /* ------------------------------------------------------------------------
       Client-side validation
       ------------------------------------------------------------------------ */

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    if (password.length < 1) {
      setError(
        "Please enter your password."
      );
      return;
    }

    if (password.length > 128) {
      setError(
        "Password is too long."
      );
      return;
    }

    /* ------------------------------------------------------------------------
       Login
       ------------------------------------------------------------------------ */

    try {
      setLoading(true);

      /* ----------------------------------------------------------------------
         OAuth2 form data

         FastAPI OAuth2PasswordRequestForm expects:

         username
         password
         ---------------------------------------------------------------------- */

      const body =
        new URLSearchParams();

      body.append(
        "username",
        normalizedEmail
      );

      body.append(
        "password",
        password
      );

      /* ----------------------------------------------------------------------
         Login API
         ---------------------------------------------------------------------- */

      const response = await api.post(
        "/auth/login",
        body,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );

      /* ----------------------------------------------------------------------
         Get JWT
         ---------------------------------------------------------------------- */

      const token =
        response.data?.access_token;

      if (!token) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      /* ----------------------------------------------------------------------
         Store JWT

         access_token = primary key
         token        = compatibility key
         ---------------------------------------------------------------------- */

      localStorage.setItem(
        "access_token",
        token
      );

      localStorage.setItem(
        "token",
        token
      );

      /* ----------------------------------------------------------------------
         Check Mentor Profile

         Existing mentor profile
             → Dashboard

         No mentor profile
             → Onboarding
         ---------------------------------------------------------------------- */

      try {
        await api.get(
          "/mentors/me"
        );

        router.push(
          "/mentor/dashboard"
        );

        return;
      } catch (profileError) {
        const status =
          (
            profileError as {
              response?: {
                status?: number;
              };
            }
          )?.response?.status;

        /*
         * Account exists but mentor profile
         * has not been created yet.
         */

        if (status === 404) {
          router.push(
            "/mentor/onboarding"
          );

          return;
        }

        /*
         * Any other error should be handled
         * by the main catch block.
         */

        throw profileError;
      }
    } catch (err) {
      console.error(
        "Mentor login failed:",
        err
      );

      /* ----------------------------------------------------------------------
         Centralized Phase 22.4 error handling
         ---------------------------------------------------------------------- */

      setError(
        getApiErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================================
     UI
     ========================================================================== */

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

        {/* ==================================================================
            HEADER
            ================================================================== */}

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <GraduationCap
              size={32}
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Mentor Login
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Access your CareerAI mentor workspace.
          </p>

        </div>

        {/* ==================================================================
            ERROR
            ================================================================== */}

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-300"
          >
            {error}
          </div>
        )}

        {/* ==================================================================
            LOGIN FORM
            ================================================================== */}

        <form
          onSubmit={submit}
          className="mt-7 space-y-5"
          noValidate
        >

          {/* ==================================================================
              EMAIL
              ================================================================== */}

          <div>

            <label
              htmlFor="mentor-email"
              className="text-sm font-medium text-slate-300"
            >
              Email
            </label>

            <div className="relative mt-2">

              <Mail
                size={18}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                id="mentor-email"
                required
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(
                    e.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="mentor@example.com"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

          </div>

          {/* ==================================================================
              PASSWORD
              ================================================================== */}

          <div>

            <label
              htmlFor="mentor-password"
              className="text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <div className="relative mt-2">

              <Lock
                size={18}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                id="mentor-password"
                required
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) => {
                  setPassword(
                    e.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Your password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {/* --------------------------------------------------------------
                  Show / Hide Password
                  -------------------------------------------------------------- */}

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff
                    size={18}
                    aria-hidden="true"
                  />
                ) : (
                  <Eye
                    size={18}
                    aria-hidden="true"
                  />
                )}
              </button>

            </div>

          </div>

          {/* ==================================================================
              LOGIN BUTTON
              ================================================================== */}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading && (
              <Loader2
                className="h-5 w-5 animate-spin"
                aria-hidden="true"
              />
            )}

            {loading
              ? "Signing in..."
              : "Login as Mentor"}

          </button>

        </form>

        {/* ==================================================================
            REGISTER
            ================================================================== */}

        <p className="mt-7 text-center text-sm text-slate-400">

          Want to become a mentor?{" "}

          <Link
            href="/mentor/register"
            className="font-semibold text-indigo-400 transition hover:text-indigo-300 hover:underline"
          >
            Register
          </Link>

        </p>

        {/* ==================================================================
            STUDENT LOGIN
            ================================================================== */}

        <Link
          href="/login"
          className="mt-4 block text-center text-sm text-slate-500 transition hover:text-white"
        >
          Student Login
        </Link>

      </div>
    </main>
  );
}