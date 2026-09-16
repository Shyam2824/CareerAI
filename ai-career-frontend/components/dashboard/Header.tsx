"use client";

import {
  Search,
  Crown,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/NotificationBell";

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();

  const name =
    user?.name?.trim() || "User";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">

      {/* SEARCH */}

      <div className="relative hidden md:block">

        <Search
          size={19}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search features..."
          className="h-11 w-80 rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />

      </div>

      {/* RIGHT */}

      <div className="ml-auto flex items-center gap-3 md:gap-4">

        {/* PLAN */}

        <button
          type="button"
          onClick={() =>
            router.push("/pricing")
          }
          className="hidden items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 md:flex"
        >
          <Crown size={17} />

          Free Plan
        </button>

        {/* NOTIFICATIONS */}

        <NotificationBell />

        {/* USER */}

        <button
          type="button"
          onClick={() =>
            router.push("/dashboard")
          }
          className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
        >

          {/* AVATAR */}

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {initials || "U"}
          </div>

          {/* USER INFO */}

          <div className="hidden text-left md:block">

            <p className="max-w-35 truncate text-sm font-semibold text-slate-800">
              {name}
            </p>

            <p className="text-xs text-slate-500">
              Free Member
            </p>

          </div>

        </button>

      </div>

    </header>
  );
}