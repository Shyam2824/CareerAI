import {
  TrendingUp,
  Users,
  FileText,
  Mic,
  IndianRupee,
} from "lucide-react";

export default function AnalyticsPage() {
  const metrics = [
    {
      title: "User Growth",
      value: "+18.5%",
      icon: Users,
    },
    {
      title: "Resume Analysis",
      value: "3,642",
      icon: FileText,
    },
    {
      title: "AI Interviews",
      value: "2,185",
      icon: Mic,
    },
    {
      title: "Revenue Growth",
      value: "+24.1%",
      icon: IndianRupee,
    },
  ];

  const months = [
    { month: "Jan", value: 40 },
    { month: "Feb", value: 55 },
    { month: "Mar", value: 48 },
    { month: "Apr", value: 70 },
    { month: "May", value: 60 },
    { month: "Jun", value: 85 },
    { month: "Jul", value: 75 },
    { month: "Aug", value: 95 },
    { month: "Sep", value: 88 },
  ];

  return (
    <div>
      <p className="font-semibold text-purple-600">
        PLATFORM INSIGHTS
      </p>

      <h1 className="mt-1 text-3xl font-bold text-slate-900">
        Analytics
      </h1>

      <p className="mt-2 text-slate-500">
        Analyze CareerAI platform growth and engagement.
      </p>

      {/* Metrics */}
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.title}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {metric.title}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {metric.value}
                  </h2>
                </div>

                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Chart */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              User Activity
            </h2>

            <p className="text-sm text-slate-500">
              Monthly platform engagement
            </p>
          </div>

          <TrendingUp className="text-purple-600" />
        </div>

        <div className="mt-10 flex h-72 items-end gap-3 border-b border-slate-200 px-2">
          {months.map((item) => (
            <div
              key={item.month}
              className="flex h-full flex-1 flex-col justify-end"
            >
              <div
                className="rounded-t-lg bg-purple-600"
                style={{
                  height: `${item.value}%`,
                }}
              />

              <p className="mt-3 text-center text-xs text-slate-500">
                {item.month}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Analytics */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Feature Usage
          </h2>

          <div className="mt-6 space-y-5">
            <Usage
              label="Resume Analysis"
              value={85}
            />

            <Usage
              label="AI Interviews"
              value={70}
            />

            <Usage
              label="Job Matching"
              value={62}
            />

            <Usage
              label="Skill Gap Analysis"
              value={58}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Subscription Distribution
          </h2>

          <div className="mt-8 space-y-6">
            <Usage
              label="Free Users"
              value={76}
            />

            <Usage
              label="Premium Users"
              value={24}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Usage({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">
          {label}
        </span>

        <span className="font-semibold text-slate-900">
          {value}%
        </span>
      </div>

      <div className="mt-2 h-3 rounded-full bg-slate-100">
        <div
          className="h-3 rounded-full bg-purple-600"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}