"use client";

import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Users,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

interface MenuItem {
  name: string;
  href: string;
  icon: ComponentType<{
    className?: string;
  }>;
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    href: "/mentor/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Profile",
    href: "/mentor/profile",
    icon: User,
  },
  {
    name: "Availability",
    href: "/mentor/dashboard/availability",
    icon: CalendarDays,
  },
  {
    name: "Bookings",
    href: "/mentor/dashboard/bookings",
    icon: Users,
  },
];

export default function MentorSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/mentor/dashboard") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950">

      {/* LOGO */}

      <div className="flex h-20 shrink-0 items-center border-b border-slate-800 px-5">
        <button
          type="button"
          onClick={() =>
            router.push("/mentor/dashboard")
          }
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <span className="text-lg font-bold text-white">
              C
            </span>
          </div>

          <div className="text-left">
            <p className="text-lg font-bold text-white">
              CareerAI
            </p>

            <p className="text-xs text-slate-500">
              Mentor Portal
            </p>
          </div>
        </button>
      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 overflow-y-auto px-3 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
          Mentor Workspace
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <button
                key={item.href}
                type="button"
                onClick={() =>
                  router.push(item.href)
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />

                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        <div className="my-6 border-t border-slate-800" />

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
          Account
        </p>

        <button
          type="button"
          onClick={() =>
            router.push("/mentor/profile")
          }
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
            pathname === "/mentor/profile"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          <Settings className="h-5 w-5 shrink-0" />

          <span>Settings</span>
        </button>

      </nav>

      {/* BOTTOM */}

      <div className="shrink-0 border-t border-slate-800 p-3">

        <button
          type="button"
          onClick={() =>
            router.push("/mentors")
          }
          className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" />

          <span>Student Marketplace</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5 shrink-0" />

          <span>Logout</span>
        </button>

      </div>
    </aside>
  );
}