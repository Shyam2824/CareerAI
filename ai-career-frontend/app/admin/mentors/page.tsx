"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  Users,
  Star,
} from "lucide-react";

import  api  from "@/services/api";

interface Mentor {
  id: number;
  user_id: number;
  title: string | null;
  company: string | null;
  experience: string | null;
  education: string | null;
  bio: string | null;
  skills: string | null;
  linkedin: string | null;
  price: number;
  is_approved: boolean;
  is_active: boolean;
  rating: number;
  total_reviews: number;
}

interface MentorStats {
  total: number;
  approved: number;
  pending: number;
  active: number;
  inactive: number;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error
  ) {
    const apiError = error as ApiErrorResponse;

    return (
      apiError.response?.data?.detail ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [stats, setStats] = useState<MentorStats>({
    total: 0,
    approved: 0,
    pending: 0,
    active: 0,
    inactive: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [mentorsResponse, statsResponse] =
        await Promise.all([
          api.get<Mentor[]>("/admin/mentors"),
          api.get<MentorStats>(
            "/admin/mentors/stats/summary"
          ),
        ]);

      setMentors(mentorsResponse.data);
      setStats(statsResponse.data);
    } catch (err: unknown) {
      console.error(
        "Failed to load mentor management:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load mentor management."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const runAction = async (
    mentorId: number,
    action: string
  ) => {
    try {
      setActionLoading(mentorId);
      setError("");

      if (action === "approve") {
        await api.post(
          `/admin/mentors/${mentorId}/approve`
        );
      }

      if (action === "reject") {
        await api.post(
          `/admin/mentors/${mentorId}/reject`
        );
      }

      if (action === "activate") {
        await api.post(
          `/admin/mentors/${mentorId}/activate`
        );
      }

      if (action === "deactivate") {
        await api.post(
          `/admin/mentors/${mentorId}/deactivate`
        );
      }

      if (action === "delete") {
        const confirmed = window.confirm(
          "Are you sure you want to permanently delete this mentor?"
        );

        if (!confirmed) {
          return;
        }

        await api.delete(
          `/admin/mentors/${mentorId}`
        );
      }

      await fetchData();
    } catch (err: unknown) {
      console.error("Mentor action failed:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to complete the action."
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-7xl mx-auto text-center py-20">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-400" />

          <p className="mt-4 text-slate-400">
            Loading mentor management...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold">
              Mentor Management
            </h1>

            <p className="text-slate-400 mt-2">
              Approve, manage and monitor mentors.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

          <StatCard
            title="Total"
            value={stats.total}
            icon={<Users size={20} />}
          />

          <StatCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle size={20} />}
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<XCircle size={20} />}
          />

          <StatCard
            title="Active"
            value={stats.active}
            icon={<UserCheck size={20} />}
          />

          <StatCard
            title="Inactive"
            value={stats.inactive}
            icon={<UserX size={20} />}
          />

        </div>

        {/* TABLE */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-800/60">

                <tr>

                  <th className="text-left px-5 py-4 text-sm text-slate-400">
                    Mentor
                  </th>

                  <th className="text-left px-5 py-4 text-sm text-slate-400">
                    Experience
                  </th>

                  <th className="text-left px-5 py-4 text-sm text-slate-400">
                    Price
                  </th>

                  <th className="text-left px-5 py-4 text-sm text-slate-400">
                    Rating
                  </th>

                  <th className="text-left px-5 py-4 text-sm text-slate-400">
                    Status
                  </th>

                  <th className="text-right px-5 py-4 text-sm text-slate-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {mentors.length === 0 ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-slate-500"
                    >
                      No mentors found.
                    </td>
                  </tr>

                ) : (

                  mentors.map((mentor) => (

                    <tr
                      key={mentor.id}
                      className="border-t border-slate-800"
                    >

                      {/* MENTOR */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-3">

                          <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                            {mentor.title
                              ? mentor.title
                                  .charAt(0)
                                  .toUpperCase()
                              : "M"}
                          </div>

                          <div>

                            <p className="font-semibold">
                              {mentor.title ||
                                "Career Mentor"}
                            </p>

                            <p className="text-sm text-slate-500">
                              {mentor.company ||
                                "Company not provided"}
                            </p>

                            <p className="text-xs text-slate-600">
                              Mentor ID: {mentor.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* EXPERIENCE */}

                      <td className="px-5 py-5 text-slate-400">
                        {mentor.experience ||
                          "Not provided"}
                      </td>

                      {/* PRICE */}

                      <td className="px-5 py-5 font-medium">
                        ₹{mentor.price}
                      </td>

                      {/* RATING */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-1">

                          <Star
                            size={16}
                            className="fill-yellow-400 text-yellow-400"
                          />

                          <span>
                            {mentor.rating.toFixed(1)}
                          </span>

                          <span className="text-xs text-slate-500">
                            ({mentor.total_reviews})
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">

                        <div className="space-y-2">

                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs ${
                              mentor.is_approved
                                ? "bg-green-500/10 text-green-400"
                                : "bg-yellow-500/10 text-yellow-400"
                            }`}
                          >
                            {mentor.is_approved
                              ? "Approved"
                              : "Pending"}
                          </span>

                          <br />

                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs ${
                              mentor.is_active
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {mentor.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </div>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-5">

                        <div className="flex flex-wrap justify-end gap-2">

                          {!mentor.is_approved && (
                            <ActionButton
                              label="Approve"
                              onClick={() =>
                                runAction(
                                  mentor.id,
                                  "approve"
                                )
                              }
                              loading={
                                actionLoading ===
                                mentor.id
                              }
                              className="bg-green-600 hover:bg-green-500"
                            />
                          )}

                          {mentor.is_approved && (
                            <ActionButton
                              label={
                                mentor.is_active
                                  ? "Deactivate"
                                  : "Activate"
                              }
                              onClick={() =>
                                runAction(
                                  mentor.id,
                                  mentor.is_active
                                    ? "deactivate"
                                    : "activate"
                                )
                              }
                              loading={
                                actionLoading ===
                                mentor.id
                              }
                              className="bg-blue-600 hover:bg-blue-500"
                            />
                          )}

                          {!mentor.is_approved && (
                            <ActionButton
                              label="Reject"
                              onClick={() =>
                                runAction(
                                  mentor.id,
                                  "reject"
                                )
                              }
                              loading={
                                actionLoading ===
                                mentor.id
                              }
                              className="bg-orange-600 hover:bg-orange-500"
                            />
                          )}

                          <ActionButton
                            label="Delete"
                            onClick={() =>
                              runAction(
                                mentor.id,
                                "delete"
                              )
                            }
                            loading={
                              actionLoading ===
                              mentor.id
                            }
                            className="bg-red-600 hover:bg-red-500"
                            icon={<Trash2 size={14} />}
                          />

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </main>
  );
}


/* ================================================= */
/* STAT CARD */
/* ================================================= */

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-sm">
          {title}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}


/* ================================================= */
/* ACTION BUTTON */
/* ================================================= */

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  loading: boolean;
  className: string;
  icon?: React.ReactNode;
}

function ActionButton({
  label,
  onClick,
  loading,
  className,
  icon,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition disabled:opacity-50 ${className}`}
    >
      {icon}

      {loading ? "..." : label}
    </button>
  );
}