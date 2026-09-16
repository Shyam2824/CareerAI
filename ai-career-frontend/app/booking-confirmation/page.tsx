"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  IndianRupee,
  UserCircle,
  ArrowRight,
  Users,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";
import  api  from "@/services/api";

/* =========================================================
   TYPES
========================================================= */

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

interface Mentor {
  id: number;
  user_id: number;
  title?: string | null;
  company?: string | null;
  experience?: string | null;
  education?: string | null;
  bio?: string | null;
  skills?: string | null;
  price?: number | null;
  rating?: number | null;
  total_reviews?: number | null;
  is_approved?: boolean;
  is_active?: boolean;
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function formatTime(date: string): string {
  try {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    case "pending":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

/* =========================================================
   PAGE
========================================================= */

function BookingConfirmationContent() {
  const searchParams = useSearchParams();

  const bookingId =
    searchParams.get("booking_id");

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [mentor, setMentor] =
    useState<Mentor | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  /* =======================================================
     LOAD BOOKING
  ======================================================= */

  useEffect(() => {
    const loadBooking = async (): Promise<void> => {
      if (!bookingId) {
        setError(
          "Booking ID is missing."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const bookingResponse =
          await api.get<Booking>(
            `/bookings/${bookingId}`
          );

        const bookingData =
          bookingResponse.data;

        setBooking(bookingData);

        /* -----------------------------------------------
           LOAD MENTOR
        ------------------------------------------------ */

        try {
          const mentorResponse =
            await api.get<Mentor>(
              `/mentors/${bookingData.mentor_id}`
            );

          setMentor(
            mentorResponse.data
          );
        } catch (mentorError) {
          /*
           * Mentor information is useful but should not
           * prevent the confirmation page from loading.
           */
          console.error(
            "Unable to load mentor:",
            mentorError
          );
        }
      } catch (bookingError: unknown) {
        console.error(
          "Unable to load booking:",
          bookingError
        );

        setError(
          bookingError instanceof Error
            ? bookingError.message
            : "Unable to load booking details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <Loader2
            size={40}
            className="mx-auto animate-spin text-purple-600"
          />

          <p className="mt-4 text-sm text-slate-500">
            Loading your booking confirmation...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle size={32} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Booking Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "We could not find this booking."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <Link
              href="/bookings"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
            >
              <CalendarDays size={18} />
              My Bookings
            </Link>

            <Link
              href="/mentors"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Users size={18} />
              Browse Mentors
            </Link>

          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">

        {/* =================================================
            SUCCESS HEADER
        ================================================= */}

        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={48} />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900 md:text-4xl">
            Booking Confirmed!
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Your mentoring session has been successfully
            booked. Your mentor will be able to see the
            booking from their dashboard.
          </p>

          <div className="mt-4 inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            Booking #{booking.id}
          </div>

        </div>

        {/* =================================================
            BOOKING DETAILS
        ================================================= */}

        <div className="mt-10 overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* CARD HEADER */}

          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Session Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Here are the details of your confirmed mentoring
              session.
            </p>
          </div>

          {/* DETAILS */}

          <div className="grid gap-5 p-6 md:grid-cols-2">

            {/* DATE */}

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <CalendarDays size={22} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Date
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {formatDate(
                      booking.booking_date
                    )}
                  </p>
                </div>

              </div>
            </div>

            {/* TIME */}

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Clock size={22} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Time
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {formatTime(
                      booking.booking_date
                    )}
                  </p>
                </div>

              </div>
            </div>

            {/* DURATION */}

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                  <Clock size={22} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Duration
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {booking.duration_minutes} minutes
                  </p>
                </div>

              </div>
            </div>

            {/* AMOUNT */}

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-green-100 p-3 text-green-600">
                  <IndianRupee size={22} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Session Amount
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    ₹
                    {Number(
                      booking.amount || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* STATUS */}

          <div className="border-t border-slate-100 p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Booking Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Payment Status
                </p>

                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold capitalize text-slate-700">
                  {booking.payment_status.replace(
                    /_/g,
                    " "
                  )}
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* =================================================
            MENTOR CARD
        ================================================= */}

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <UserCircle size={30} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Your Mentor
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {mentor?.title ||
                  `Mentor #${booking.mentor_id}`}
              </h2>

              {mentor?.company && (
                <p className="text-sm text-slate-500">
                  {mentor.company}
                </p>
              )}
            </div>

          </div>

          {mentor && (
            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Experience
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {mentor.experience ||
                    "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Rating
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {mentor.rating &&
                  mentor.rating > 0
                    ? `${mentor.rating.toFixed(
                        1
                      )} / 5`
                    : "New Mentor"}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* =================================================
            NOTES
        ================================================= */}

        {booking.notes && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="font-bold text-slate-900">
              Your Notes
            </h2>

            <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {booking.notes}
            </p>

          </div>
        )}

        {/* =================================================
            NEXT STEPS
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50 p-6">

          <h2 className="font-bold text-purple-900">
            What happens next?
          </h2>

          <div className="mt-4 space-y-3">

            <div className="flex items-start gap-3">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-purple-600"
              />

              <p className="text-sm text-purple-800">
                Your session has been added to your bookings.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-purple-600"
              />

              <p className="text-sm text-purple-800">
                The selected availability slot is no longer
                available to other students.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-purple-600"
              />

              <p className="text-sm text-purple-800">
                You can manage or cancel the session from
                My Bookings.
              </p>
            </div>

          </div>
        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <Link
            href="/bookings"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            <CalendarDays size={19} />
            View My Bookings
            <ArrowRight size={17} />
          </Link>

          <Link
            href="/mentors"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Users size={19} />
            Browse More Mentors
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Home size={18} />
            Dashboard
          </Link>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="pb-5 pt-10 text-center text-sm text-slate-400">
          CareerAI Mentor Platform
        </div>

      </div>
    </div>
  );
}

function BookingConfirmationLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <Loader2
          size={40}
          className="mx-auto animate-spin text-purple-600"
        />
        <h2 className="mt-4 text-xl font-semibold text-slate-800">
          Loading booking confirmation...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Please wait.
        </p>
      </div>
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<BookingConfirmationLoading />}>
      <BookingConfirmationContent />
    </Suspense>
  );
}