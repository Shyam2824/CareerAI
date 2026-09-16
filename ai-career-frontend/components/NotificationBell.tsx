"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, Loader2 } from "lucide-react";
import api from "@/services/api";

interface NotificationSummary {
  total: number;
  unread: number;
}

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  related_id: number | null;
  is_read: boolean;
  created_at: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
    status?: number;
  };
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const apiError = error as ApiErrorResponse;

    return (
      apiError.response?.data?.detail ||
      `Unable to load notifications${
        apiError.response?.status
          ? ` (${apiError.response.status})`
          : ""
      }.`
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load notifications.";
}

export default function NotificationBell() {
  const [summary, setSummary] = useState<NotificationSummary>({
    total: 0,
    unread: 0,
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get<NotificationSummary>(
        "/notifications/summary"
      );

      setSummary(response.data);
    } catch (err: unknown) {
      console.error("Notification summary error:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Notification[]>(
        "/notifications/my"
      );

      setNotifications(response.data.slice(0, 5));
    } catch (err: unknown) {
      console.error("Notification loading error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummary();

    const interval = window.setInterval(() => {
      fetchSummary();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchSummary]);

  const handleOpen = () => {
    const nextState = !open;

    setOpen(nextState);

    if (nextState) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );

      setSummary((current) => ({
        ...current,
        unread: Math.max(0, current.unread - 1),
      }));
    } catch (err: unknown) {
      console.error(
        "Failed to mark notification as read:",
        err
      );
    }
  };

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={20} />

        {summary.unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {summary.unread > 9 ? "9+" : summary.unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Mobile/backdrop */}
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
          />

          <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <div>
                <h3 className="font-semibold text-white">
                  Notifications
                </h3>

                <p className="text-xs text-slate-500">
                  {summary.unread} unread
                </p>
              </div>

              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-blue-400 transition hover:text-blue-300"
              >
                View All
              </Link>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center p-8">
                <Loader2
                  size={22}
                  className="animate-spin text-blue-400"
                />
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="p-5 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Empty */}
            {!loading &&
              !error &&
              notifications.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">
                  No notifications yet.
                </div>
              )}

            {/* Notifications */}
            {!loading &&
              !error &&
              notifications.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-b border-slate-800 p-4 ${
                        notification.is_read
                          ? ""
                          : "bg-blue-500/5"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">
                          <Bell
                            size={16}
                            className="text-blue-400"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {notification.message}
                          </p>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-600">
                              {new Date(
                                notification.created_at
                              ).toLocaleString()}
                            </span>

                            {!notification.is_read && (
                              <button
                                type="button"
                                onClick={() =>
                                  markAsRead(
                                    notification.id
                                  )
                                }
                                className="flex items-center gap-1 text-xs text-blue-400 transition hover:text-blue-300"
                              >
                                <Check size={13} />
                                Read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
}