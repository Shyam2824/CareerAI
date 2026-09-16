"use client";

interface CareerInsight {
  title: string;
  description: string;
  priority: string;
}

interface CareerInsightsResponse {
  overall_message: string;
  insights: CareerInsight[];
}

interface Props {
  data: CareerInsightsResponse | null;
  loading: boolean;
}

export default function CareerInsights({
  data,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-800 rounded mt-4" />
        <div className="h-4 w-3/4 bg-slate-800 rounded mt-3" />
      </div>
    );
  }

  if (!data || data.insights.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="text-4xl">🤖</div>

        <h2 className="text-xl font-bold mt-4">
          AI Career Insights
        </h2>

        <p className="text-slate-400 text-sm mt-2">
          Upload and analyze a resume to receive personalized
          career recommendations.
        </p>
      </div>
    );
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return {
          badge:
            "bg-red-500/10 text-red-400 border-red-500/20",
          icon: "🔴",
        };

      case "medium":
        return {
          badge:
            "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          icon: "🟡",
        };

      default:
        return {
          badge:
            "bg-green-500/10 text-green-400 border-green-500/20",
          icon: "🟢",
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <div className="flex items-start justify-between gap-4">

        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl">
              🤖
            </div>

            <div>
              <h2 className="text-xl font-bold">
                AI Career Insights
              </h2>

              <p className="text-xs text-purple-400 mt-1">
                Personalized recommendations
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-400 mt-5">
            {data.overall_message}
          </p>
        </div>

      </div>

      <div className="mt-6 space-y-4">

        {data.insights.map((insight, index) => {
          const style = getPriorityStyle(
            insight.priority
          );

          return (
            <div
              key={index}
              className="border border-slate-800 bg-slate-950/50 rounded-xl p-5 hover:border-slate-700 transition"
            >
              <div className="flex gap-4">

                <div className="text-xl">
                  {style.icon}
                </div>

                <div className="flex-1">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

                    <h3 className="font-semibold">
                      {insight.title}
                    </h3>

                    <span
                      className={`px-3 py-1 text-xs border rounded-full capitalize ${style.badge}`}
                    >
                      {insight.priority}
                      {" "}priority
                    </span>

                  </div>

                  <p className="text-sm text-slate-400 leading-6 mt-3">
                    {insight.description}
                  </p>

                </div>

              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}