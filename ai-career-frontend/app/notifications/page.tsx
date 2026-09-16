"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Loader2,
  Trash2,
} from "lucide-react";

import  api  from "@/services/api";

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
  };
}

function getErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error
  ) {
    const apiError =
      error as ApiErrorResponse;

    return (
      apiError.response?.data?.detail ||
      "Unable to load notifications."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load notifications.";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchNotifications =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<Notification[]>(
            "/notifications/my"
          );

        setNotifications(response.data);
      } catch (err: unknown) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (
    id: number
  ) => {
    try {
      await api.patch(
        `/notifications/${id}/read`
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      );
    } catch (err: unknown) {
      console.error(
        "Failed to mark notification:",
        err
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch(
        "/notifications/read-all"
      );

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
        }))
      );
    } catch (err: unknown) {
      console.error(
        "Failed to mark all notifications:",
        err
      );
    }
  };

  const deleteNotification = async (
    id: number
  ) => {
    try {
      await api.delete(
        `/notifications/${id}`
      );

      setNotifications((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );
    } catch (err: unknown) {
      console.error(
        "Failed to delete notification:",
        err
      );
    }
  };

  const unreadCount =
    notifications.filter(
      (item) => !item.is_read
    ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="mx-auto max-w-4xl px-4 py-20 text-center">

          <Loader2
            className="mx-auto animate-spin text-blue-400"
            size={30}
          />

          <p className="mt-4 text-slate-400">
            Loading notifications...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-4xl px-4 py-8">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <Link
              href="/dashboard"
              className="mb-4 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Bell
                  size={24}
                  className="text-blue-400"
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Notifications
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {unreadCount} unread notifications
                </p>
              </div>

            </div>

          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
            >
              <CheckCheck size={17} />
              Mark All as Read
            </button>
          )}

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* NOTIFICATIONS */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          {notifications.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <Bell
                size={40}
                className="mx-auto text-slate-700"
              />

              <h2 className="mt-4 font-semibold">
                No notifications
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                You&apos;re all caught up.
              </p>

            </div>

          ) : (

            <div>

              {notifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-slate-800 p-5 last:border-b-0 ${
                      notification.is_read
                        ? ""
                        : "bg-blue-500/5"
                    }`}
                  >

                    <div className="flex gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                        <Bell
                          size={18}
                          className="text-blue-400"
                        />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                          <div>

                            <h3 className="font-semibold">
                              {notification.title}
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-slate-400">
                              {notification.message}
                            </p>

                          </div>

                          {!notification.is_read && (
                            <span className="w-fit rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
                              New
                            </span>
                          )}

                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4">

                          <span className="text-xs text-slate-600">
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
                              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                            >
                              <Check size={14} />
                              Mark as read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              deleteNotification(
                                notification.id
                              )
                            }
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          )}

        </div>

      </div>

    </main>
  );
}