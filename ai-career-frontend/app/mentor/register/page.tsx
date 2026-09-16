"use client";

import Link from "next/link";
import {
  FormEvent,
  ReactNode,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  GraduationCap,
  Loader2,
  Mail,
  Lock,
  User,
} from "lucide-react";

import api from "@/services/api";
import {
  getApiErrorMessage,
} from "@/services/apiError";

/* ========================================================================
   Mentor Register Page
   Phase 22.4.4
   ======================================================================== */

export default function MentorRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ----------------------------------------------------------------------
     Update field
     ---------------------------------------------------------------------- */

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear previous error while typing
    if (error) {
      setError("");
    }
  };

  /* ----------------------------------------------------------------------
     Submit
     ---------------------------------------------------------------------- */

  const submit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Prevent duplicate submission
    if (loading) {
      return;
    }

    setError("");

    const name = form.name.trim();
    const email = form.email
      .trim()
      .toLowerCase();

    const password = form.password;

    /* ------------------------- Validation ------------------------- */

    if (!name) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (name.length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (name.length > 100) {
      setError(
        "Name must contain fewer than 100 characters."
      );
      return;
    }

    if (!email) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    // Basic email validation
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter a password."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password.length > 128) {
      setError(
        "Password must contain fewer than 128 characters."
      );
      return;
    }

    /* ---------------------------- API ----------------------------- */

    try {
      setLoading(true);

      await api.post(
        "/auth/register",
        {
          name,
          email,
          password,
        }
      );

      /*
       * Registration successful.
       *
       * Send the mentor to login.
       * mentor=1 tells the login page this is
       * the mentor registration flow.
       */

      router.push(
        `/login?email=${encodeURIComponent(
          email
        )}&mentor=1`
      );
    } catch (err) {
      console.error(
        "Mentor registration failed:",
        err
      );

      setError(
        getApiErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================================
     UI
     ====================================================================== */

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

        {/* ----------------------------------------------------------------
            Header
            ---------------------------------------------------------------- */}

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <GraduationCap
              size={32}
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Become a Mentor
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Create your CareerAI account,
            then build your mentor profile.
          </p>
        </div>

        {/* ----------------------------------------------------------------
            Error
            ---------------------------------------------------------------- */}

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm leading-5 text-red-300"
          >
            {error}
          </div>
        )}

        {/* ----------------------------------------------------------------
            Form
            ---------------------------------------------------------------- */}

        <form
          onSubmit={submit}
          className="mt-7 space-y-5"
          noValidate
        >

          {/* Name */}

          <Field
            icon={
              <User
                size={18}
                aria-hidden="true"
              />
            }
            label="Full Name"
            value={form.name}
            onChange={(value) =>
              updateField(
                "name",
                value
              )
            }
            placeholder="Your full name"
            autoComplete="name"
            disabled={loading}
          />

          {/* Email */}

          <Field
            icon={
              <Mail
                size={18}
                aria-hidden="true"
              />
            }
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) =>
              updateField(
                "email",
                value
              )
            }
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
          />

          {/* Password */}

          <Field
            icon={
              <Lock
                size={18}
                aria-hidden="true"
              />
            }
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) =>
              updateField(
                "password",
                value
              )
            }
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            disabled={loading}
          />

          {/* Password hint */}

          <p className="-mt-2 text-xs text-slate-500">
            Use at least 8 characters.
          </p>

          {/* Submit */}

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
              ? "Creating account..."
              : "Create Mentor Account"}
          </button>
        </form>

        {/* ----------------------------------------------------------------
            Login
            ---------------------------------------------------------------- */}

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}

          <Link
            href="/mentor/login"
            className="font-semibold text-indigo-400 hover:underline"
          >
            Login
          </Link>
        </p>

        {/* ----------------------------------------------------------------
            Student Login
            ---------------------------------------------------------------- */}

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

/* ========================================================================
   Field Component
   ======================================================================== */

interface FieldProps {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  disabled = false,
}: FieldProps) {
  return (
    <div>

      <label className="text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="relative mt-2">

        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>

        <input
          required
          type={type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}