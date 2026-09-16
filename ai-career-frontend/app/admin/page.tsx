import type { ReactNode } from "react";

import {
  Users,
  GraduationCap,
  FileText,
  IndianRupee,
  TrendingUp,
  UserCheck,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "1,248",
      change: "+12.5%",
      icon: Users,
    },
    {
      title: "Total Mentors",
      value: "86",
      change: "+8.2%",
      icon: GraduationCap,
    },
    {
      title: "Resume Analysis",
      value: "3,642",
      change: "+18.4%",
      icon: FileText,
    },
    {
      title: "Total Revenue",
      value: "₹1,24,500",
      change: "+24.1%",
      icon: IndianRupee,
    },
  ];

  return (
    <div>
      <p className="font-semibold text-purple-600">
        ADMIN OVERVIEW
      </p>

      <h1 className="mt-1 text-3xl font-bold text-slate-900">
        Dashboard
      </h1>

      <p className="mt-2 text-slate-500">
        Monitor your CareerAI platform performance.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </h2>
                </div>

                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <Icon size={22} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
                <ArrowUpRight size={16} />
                <span>{stat.change}</span>
                <span className="text-slate-400">
                  vs last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Platform Overview
              </h2>

              <p className="text-sm text-slate-500">
                Monthly activity
              </p>
            </div>

            <TrendingUp className="text-purple-600" />
          </div>

          <div className="mt-8 flex h-64 items-end gap-3">
            {[40, 60, 45, 75, 55, 90, 65, 95, 70, 85, 100, 80].map(
              (height, index) => (
                <div
                  key={index}
                  className="w-full rounded-t bg-purple-500"
                  style={{ height: `${height}%` }}
                />
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Quick Status
          </h2>

          <div className="mt-6 space-y-6">
            <Status
              icon={<UserCheck size={20} />}
              title="Active Users"
              value="1,102 currently active"
            />

            <Status
              icon={<Clock size={20} />}
              title="Pending Mentors"
              value="12 waiting approval"
            />

            <Status
              icon={<FileText size={20} />}
              title="Today's Analysis"
              value="248 resumes analyzed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Status({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
        {icon}
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          {title}
        </p>

        <p className="text-sm text-slate-500">
          {value}
        </p>
      </div>
    </div>
  );
}