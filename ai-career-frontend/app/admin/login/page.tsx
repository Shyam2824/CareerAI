"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

type AdminData = {
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const handleLogin = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    const savedAdmin =
      localStorage.getItem("careerai-admin");

    if (!savedAdmin) {
      setError(
        "Admin account not found. Please register first."
      );
      return;
    }

    try {
      const admin: AdminData =
        JSON.parse(savedAdmin);

      if (
        admin.email === email &&
        admin.password === password
      ) {
        localStorage.setItem(
          "careerai-admin-logged-in",
          "true"
        );

        router.push("/admin");
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 text-white">
            <ShieldCheck size={32} />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Admin Login
          </h1>

          <p className="mt-2 text-slate-500">
            CareerAI Administration Portal
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Admin Email
            </label>

            <div className="relative mt-2">
              <Mail
                size={18}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <input
                type="email"
                placeholder="admin@careerai.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 p-3 pl-10 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>

            <div className="relative mt-2">
              <Lock
                size={18}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 p-3 pl-10 pr-12 outline-none focus:border-purple-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-3 text-slate-400"
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            Login to Admin Panel
          </button>
        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Do not have an admin account?{" "}
          <Link
            href="/admin/register"
            className="font-semibold text-purple-600 hover:text-purple-700"
          >
            Register
          </Link>
        </p>

        <div className="mt-6 border-t pt-5 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-purple-600"
          >
            ← Back to CareerAI
          </Link>
        </div>
      </div>
    </div>
  );
}