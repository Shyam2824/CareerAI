"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Resume {
  id: number;
  file_name: string;
  ats_score: number;
  created_at: string | null;
}

interface Props {
  resumes: Resume[];
}

export default function ResumePerformanceChart({
  resumes,
}: Props) {
  const chartData = resumes.map(
    (resume, index) => ({
      name: `Resume ${index + 1}`,
      score: Number(resume.ats_score),
      date: resume.created_at
        ? new Date(
            resume.created_at
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })
        : "Unknown",
    })
  );

  if (chartData.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
        <div className="text-4xl">📈</div>

        <h3 className="text-lg font-semibold mt-4">
          No Performance Data
        </h3>

        <p className="text-slate-400 text-sm mt-2">
          Upload resumes to track your ATS score improvement.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <div className="mb-6">
        <h2 className="text-xl font-bold">
          ATS Score Progress
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Track your resume performance over time.
        </p>
      </div>

      <div className="h-87.5">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={chartData}>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
            />

            <XAxis
              dataKey="name"
              stroke="#94a3b8"
            />

            <YAxis
              domain={[0, 100]}
              stroke="#94a3b8"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "10px",
              }}
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}