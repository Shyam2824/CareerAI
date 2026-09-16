"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  User,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";

import  api  from "@/services/api";

interface Booking {
  id: number;
  user_id: number;
  mentor_id: number;
  availability_id: number;
  booking_date: string;
  duration_minutes: number;
  amount: number;
  status: string;
  payment_status: string;
  notes?: string | null;
  created_at: string;
}

interface ApiError {
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
    const apiError = error as ApiError;

    return (
      apiError.response?.data?.detail ||
      "Something went wrong."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MentorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Booking[]>(
        "/bookings/mentor/my"
      );

      setBookings(response.data);
    } catch (err: unknown) {
      console.error(
        "Failed to load mentor bookings:",
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, [fetchBookings]);

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-slate-400">
            Loading your bookings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              Mentor Bookings
            </h1>

            <p className="mt-2 text-slate-400">
              Manage sessions booked by students.
            </p>
          </div>

          <Link
            href="/mentor/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>

        </div>


        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}


        {/* STATS */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Total Bookings
            </p>

            <p className="mt-2 text-3xl font-bold">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Confirmed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {confirmedBookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Cancelled
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {cancelledBookings.length}
            </p>
          </div>

        </div>


        {/* BOOKINGS */}

        {bookings.length === 0 ? (

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">

            <CalendarDays
              size={48}
              className="mx-auto text-slate-600"
            />

            <h2 className="mt-5 text-xl font-semibold">
              No bookings yet
            </h2>

            <p className="mt-2 text-slate-500">
              Student bookings will appear here.
            </p>

          </section>

        ) : (

          <div className="space-y-5">

            {bookings.map((booking) => {

              const isCancelled =
                booking.status === "cancelled";

              return (
                <article
                  key={booking.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                    {/* BOOKING INFORMATION */}

                    <div className="space-y-5">

                      <div className="flex items-center gap-3">

                        {isCancelled ? (
                          <XCircle
                            size={23}
                            className="text-red-400"
                          />
                        ) : (
                          <CheckCircle
                            size={23}
                            className="text-green-400"
                          />
                        )}

                        <div>
                          <h2 className="text-xl font-semibold">
                            Mentor Session
                          </h2>

                          <p className="text-sm text-slate-500">
                            Booking #{booking.id}
                          </p>
                        </div>

                      </div>


                      {/* STUDENT */}

                      <div className="flex items-center gap-3">

                        <User
                          size={19}
                          className="text-blue-400"
                        />

                        <div>
                          <p className="text-xs text-slate-500">
                            Student ID
                          </p>

                          <p className="text-sm text-slate-300">
                            User #{booking.user_id}
                          </p>
                        </div>

                      </div>


                      {/* DATE */}

                      <div className="flex items-center gap-3">

                        <CalendarDays
                          size={19}
                          className="text-blue-400"
                        />

                        <div>
                          <p className="text-xs text-slate-500">
                            Date
                          </p>

                          <p className="text-sm text-slate-300">
                            {formatDate(
                              booking.booking_date
                            )}
                          </p>
                        </div>

                      </div>


                      {/* TIME */}

                      <div className="flex items-center gap-3">

                        <Clock
                          size={19}
                          className="text-blue-400"
                        />

                        <div>
                          <p className="text-xs text-slate-500">
                            Time
                          </p>

                          <p className="text-sm text-slate-300">
                            {formatTime(
                              booking.booking_date
                            )}

                            {" • "}

                            {booking.duration_minutes} minutes
                          </p>
                        </div>

                      </div>


                      {/* NOTES */}

                      {booking.notes && (
                        <div className="rounded-xl bg-slate-950 p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Student Notes
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {booking.notes}
                          </p>

                        </div>
                      )}

                    </div>


                    {/* STATUS */}

                    <div className="lg:min-w-45 lg:text-right">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          isCancelled
                            ? "bg-red-500/10 text-red-400"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {isCancelled
                          ? "Cancelled"
                          : "Confirmed"}
                      </span>

                      <p className="mt-5 text-2xl font-bold">
                        ₹{booking.amount}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Payment:{" "}
                        {booking.payment_status}
                      </p>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}