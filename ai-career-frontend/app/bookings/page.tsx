/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Clock, XCircle, CheckCircle } from "lucide-react";
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

export default function StudentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Booking[]>(
        "/bookings/my"
      );

      setBookings(response.data);
    } catch (err: unknown) {
      console.error("Failed to load bookings:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = async (bookingId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setError("");

      await api.patch(
        `/bookings/${bookingId}/cancel`
      );

      await fetchBookings();
    } catch (err: unknown) {
      console.error("Failed to cancel booking:", err);
      setError(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-slate-400">
            Loading your bookings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            My Mentor Bookings
          </h1>

          <p className="text-slate-400 mt-2">
            View and manage your mentor sessions.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">

            <CalendarDays
              size={48}
              className="mx-auto text-slate-600"
            />

            <h2 className="text-xl font-semibold mt-5">
              No bookings yet
            </h2>

            <p className="text-slate-500 mt-2">
              Book a session with a mentor to get started.
            </p>

            <a
              href="/mentors"
              className="inline-block mt-6 rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500 transition"
            >
              Browse Mentors
            </a>

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

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                    <div>

                      <div className="flex items-center gap-3">
                        {isCancelled ? (
                          <XCircle
                            size={22}
                            className="text-red-400"
                          />
                        ) : (
                          <CheckCircle
                            size={22}
                            className="text-green-400"
                          />
                        )}

                        <h2 className="text-xl font-semibold">
                          Mentor Session
                        </h2>
                      </div>

                      <div className="mt-5 space-y-3">

                        <div className="flex items-center gap-3 text-slate-300">
                          <CalendarDays
                            size={18}
                            className="text-blue-400"
                          />

                          <span>
                            {formatDate(
                              booking.booking_date
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-slate-300">
                          <Clock
                            size={18}
                            className="text-blue-400"
                          />

                          <span>
                            {formatTime(
                              booking.booking_date
                            )}
                            {" • "}
                            {booking.duration_minutes} minutes
                          </span>
                        </div>

                        <div className="text-slate-400">
                          Booking ID:{" "}
                          <span className="text-slate-200">
                            #{booking.id}
                          </span>
                        </div>

                      </div>

                      {booking.notes && (
                        <div className="mt-5 rounded-xl bg-slate-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Your Notes
                          </p>

                          <p className="text-sm text-slate-300 mt-2">
                            {booking.notes}
                          </p>
                        </div>
                      )}

                    </div>

                    <div className="md:text-right">

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

                      <p className="text-2xl font-bold mt-4">
                        ₹{booking.amount}
                      </p>

                      <p className="text-xs text-slate-500">
                        Payment:{" "}
                        {booking.payment_status}
                      </p>

                      {!isCancelled && (
                        <button
                          type="button"
                          disabled={
                            cancellingId === booking.id
                          }
                          onClick={() =>
                            cancelBooking(
                              booking.id
                            )
                          }
                          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition"
                        >
                          <XCircle size={16} />

                          {cancellingId === booking.id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}

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