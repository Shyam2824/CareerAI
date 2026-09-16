"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Mic,
  Users,
  Sparkles,
  FilePlus2,
  Mail,
  BookOpen,
  BarChart3,
  CreditCard,
  LogOut,
  CalendarDays,
  BrainCircuit,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";


/* =========================================================
   MAIN MENU
========================================================= */

const mainMenu = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Resume Analysis",
    href: "/resume",
    icon: FileText,
  },
  {
    name: "Job Match",
    href: "/job-match",
    icon: Briefcase,
  },
  {
    name: "Interview Center",
    href: "/interview",
    icon: Mic,
  },
  {
    name: "Mentors",
    href: "/mentors",
    icon: Users,
  },
  {
    name: "My Bookings",
    href: "/bookings",
    icon: CalendarDays,
  },
  {
    name: "Career Intelligence",
    href: "/career-intelligence",
    icon: BrainCircuit,
  },
];


/* =========================================================
   CAREER TOOLS
========================================================= */

const careerTools = [
  {
    name: "Resume Improvement",
    href: "/resume-improve",
    icon: Sparkles,
  },
  {
    name: "Resume Builder",
    href: "/resume-builder",
    icon: FilePlus2,
  },
  {
    name: "Cover Letter",
    href: "/cover-letter",
    icon: Mail,
  },
  {
    name: "Questions Bank",
    href: "/interview",
    icon: BookOpen,
  },
  {
    name: "Interview Analytics",
    href: "/interview/analytics",
    icon: BarChart3,
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
];


/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { logout } = useAuth();


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };


  /* =======================================================
     ACTIVE ROUTE
  ======================================================= */

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">


      {/* ===================================================
          LOGO
      =================================================== */}

      <div className="flex h-24 shrink-0 items-center gap-3 border-b border-slate-100 px-6">

        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Sparkles size={23} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              CareerAI
            </h1>

            <p className="text-xs text-slate-500">
              AI Career Platform
            </p>
          </div>

        </Link>

      </div>


      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <nav className="flex-1 overflow-y-auto px-4 py-6">


        {/* =================================================
            MAIN MENU
        ================================================= */}

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <div className="space-y-1">

          {mainMenu.map((item) => {

            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                }`}
              >

                <Icon size={19} />

                <span>
                  {item.name}
                </span>

              </Link>
            );

          })}

        </div>


        {/* =================================================
            CAREER TOOLS
        ================================================= */}

        <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Career Tools
        </p>

        <div className="space-y-1">

          {careerTools.map((item) => {

            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                }`}
              >

                <Icon size={19} />

                <span>
                  {item.name}
                </span>

              </Link>
            );

          })}

        </div>

      </nav>


      {/* ===================================================
          PREMIUM
      =================================================== */}

      <div className="shrink-0 px-4 pb-3">

        <div className="rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 p-5 text-white">

          <Sparkles size={22} />

          <h3 className="mt-3 font-bold">
            Unlock Premium
          </h3>

          <p className="mt-2 text-xs leading-5 text-blue-100">
            Get unlimited AI tools and advanced career insights.
          </p>

          <Link
            href="/pricing"
            className="mt-4 block rounded-xl bg-white py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Upgrade Now
          </Link>

        </div>

      </div>


      {/* ===================================================
          LOGOUT
      =================================================== */}

      <div className="shrink-0 border-t border-slate-100 p-4">

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
        >

          <LogOut size={19} />

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
}