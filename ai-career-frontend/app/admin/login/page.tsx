"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("username", normalizedEmail);
      formData.append("password", password);

      const response = await api.post<{ access_token: string; token_type: string }>(
        "/auth/login",
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const token = response.data.access_token;
      if (!token) throw new Error("No access token returned by server.");

      localStorage.setItem("access_token", token);
      localStorage.setItem("token", token);
      localStorage.setItem("token_type", "bearer");

      const me = await api.get<{ id: number; name: string; email: string; role: string }>("/auth/me");
      if (me.data.role !== "admin") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("token_type");
        setError("This account does not have administrator access.");
        return;
      }

      await api.get("/admin/me");
      router.push("/admin");
    } catch (err: unknown) {
      console.error("Admin login failed:", err);
      if (typeof err === "object" && err && "response" in err) {
        const response = (err as { response?: { status?: number; data?: { detail?: string; error?: { message?: string } } } }).response;
        setError(response?.data?.error?.message || response?.data?.detail || "Invalid admin email or password.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to connect to CareerAI server.");
      }
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