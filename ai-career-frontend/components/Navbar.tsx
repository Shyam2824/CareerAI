"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold"
        >
          <div className="rounded-lg bg-blue-600 p-2 text-white">
            <Sparkles size={18} />
          </div>

          CareerAI
        </Link>

        <div className="flex items-center gap-3">

        <Link
          href="/job-match"
          className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Job Match
        </Link>

        <Link
          href="/login"
          className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Get Started
        </Link>

      </div>
      </div>
    </nav>
  );
}