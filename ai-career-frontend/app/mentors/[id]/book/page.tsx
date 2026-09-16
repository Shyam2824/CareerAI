"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  CheckCircle,
  UserCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import  api  from "@/services/api";

/* =========================================================
   TYPES
========================================================= */

interface Availability {
  id: number;
  mentor_id: number;
  available_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

interface Mentor {
  id: number;
  user_id?: number;
  title: string | null;
  company: string | null;
  experience?: string | null;
  education?: string | null;
  bio?: string | null;
  skills?: string | null;
  price: number;
  rating: number;
  total_reviews: number;
  is_approved?: boolean;
  is_active?: boolean;
}

interface BookingResponse {
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
  created_at?: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string | Array<{ msg?: string }>;
    };
  };
}

/* =========================================================
   ERROR HELPER
========================================================= */

function getErrorMessage(
  error: unknown
): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error
  ) {
    const apiError =
      error as ApiErrorResponse;

    const detail =
      apiError.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map(
          (item) =>
            item.msg || ""
        )
        .filter(Boolean)
        .join(", ");
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
  dateString: string
): string {
  try {
    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  } catch {
    return dateString;
  }
}

/* =========================================================
   TIME FORMAT
========================================================= */

function formatTime(
  timeString: string
): string {
  try {
    const [
      hoursString,
      minutesString,
    ] = timeString.split(":");

    const hours = Number(
      hoursString
    );

    const minutes = Number(
      minutesString
    );

    const date = new Date();

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  } catch {
    return timeString;
  }
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MentorBookingPage() {
  const params = useParams();
  const router = useRouter();

  /* =======================================================
     MENTOR ID
  ======================================================= */

  const mentorId = Array.isArray(
    params.id
  )
    ? params.id[0]
    : params.id;

  /* =======================================================
     STATE
  ======================================================= */

  const [mentor, setMentor] =
    useState<Mentor | null>(null);

  const [slots, setSlots] =
    useState<Availability[]>([]);

  const [selectedSlot, setSelectedSlot] =
    useState<Availability | null>(null);

  const [notes, setNotes] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(true);

  const [booking, setBooking] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  /* =======================================================
     FETCH MENTOR + AVAILABILITY
  ======================================================= */

  const fetchData =
    useCallback(async (): Promise<void> => {
      if (!mentorId) {
        setError(
          "Mentor ID is missing."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const [
          mentorResponse,
          availabilityResponse,
        ] = await Promise.all([
          api.get<Mentor>(
            `/mentors/${mentorId}`
          ),

          api.get<Availability[]>(
            `/mentor-availability/mentor/${mentorId}`
          ),
        ]);

        setMentor(
          mentorResponse.data
        );

        /*
         * Only show unbooked slots.
         */
        setSlots(
          availabilityResponse.data.filter(
            (slot) =>
              !slot.is_booked
          )
        );
      } catch (err: unknown) {
        console.error(
          "Failed to load booking information:",
          err
        );

        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    }, [mentorId]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  /* =======================================================
     CREATE BOOKING
     PAYMENT IS CURRENTLY NOT REQUIRED
  ======================================================= */

  const handleBooking =
    async (): Promise<void> => {
      if (!selectedSlot) {
        setError(
          "Please select an available time slot."
        );

        return;
      }

      if (!mentor) {
        setError(
          "Mentor information is unavailable."
        );

        return;
      }

      try {
        setBooking(true);
        setError("");

        /*
         * Create booking directly.
         *
         * Payment is intentionally skipped
         * because Razorpay is paused.
         */

        const response =
          await api.post<BookingResponse>(
            "/bookings",
            {
              availability_id:
                selectedSlot.id,

              notes:
                notes.trim() || null,
            }
          );

        const createdBooking =
          response.data;

        /*
         * Redirect to confirmation page.
         */

        router.push(
          `/booking-confirmation?booking_id=${createdBooking.id}`
        );
      } catch (err: unknown) {
        console.error(
          "Booking failed:",
          err
        );

        setError(
          getErrorMessage(err)
        );

        setBooking(false);
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">

          <Loader2
            size={40}
            className="mx-auto animate-spin text-blue-500"
          />

          <p className="mt-4 text-slate-400">
            Loading available sessions...
          </p>

        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-5xl px-4 py-10">

        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            router.push(
              `/mentors/${mentorId}`
            )
          }
          className="mb-8 flex items-center gap-2 text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />

          Back to Mentor
        </button>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <CalendarDays size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                Book a Mentor Session
              </h1>

              {mentor && (
                <p className="mt-2 text-slate-400">
                  {mentor.title ||
                    "Career Mentor"}

                  {mentor.company
                    ? ` • ${mentor.company}`
                    : ""}
                </p>
              )}
            </div>

          </div>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm">
              {error}
            </p>

          </div>
        )}

        {/* ==================================================
            MAIN GRID
        ================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* =================================================
              AVAILABLE SLOTS
          ================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

            <div className="mb-6 flex items-center gap-3">

              <CalendarDays
                size={22}
                className="text-blue-400"
              />

              <div>
                <h2 className="text-xl font-semibold">
                  Available Sessions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a date and time.
                </p>
              </div>

            </div>

            {/* NO SLOTS */}

            {slots.length === 0 ? (

              <div className="py-16 text-center">

                <CalendarDays
                  size={45}
                  className="mx-auto text-slate-600"
                />

                <h3 className="mt-4 text-lg font-semibold">
                  No available sessions
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  This mentor has not added any
                  available sessions yet.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/mentors/${mentorId}`
                    )
                  }
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
                >
                  Back to Mentor
                </button>

              </div>

            ) : (

              <div className="space-y-4">

                {slots.map(
                  (
                    slot: Availability
                  ) => {

                    const selected =
                      selectedSlot?.id ===
                      slot.id;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() =>
                          setSelectedSlot(
                            slot
                          )
                        }
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-700 bg-slate-950 hover:border-slate-500"
                        }`}
                      >

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div>

                            <p className="font-semibold">
                              {formatDate(
                                slot.available_date
                              )}
                            </p>

                            <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">

                              <Clock
                                size={16}
                              />

                              <span>
                                {formatTime(
                                  slot.start_time
                                )}
                              </span>

                              <span>
                                -
                              </span>

                              <span>
                                {formatTime(
                                  slot.end_time
                                )}
                              </span>

                            </div>

                          </div>

                          {selected && (
                            <span className="flex items-center gap-1 text-sm font-medium text-blue-400">
                              <CheckCircle
                                size={16}
                              />

                              Selected
                            </span>
                          )}

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            )}

          </section>

          {/* =================================================
              BOOKING SUMMARY
          ================================================= */}

          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              Booking Summary
            </h2>

            {/* MENTOR */}

            {mentor && (
              <div className="mt-5 border-b border-slate-800 pb-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                    <UserCircle size={25} />
                  </div>

                  <div>

                    <p className="text-sm text-slate-500">
                      Mentor
                    </p>

                    <p className="mt-1 font-medium">
                      {mentor.title ||
                        "Career Mentor"}
                    </p>

                    {mentor.company && (
                      <p className="mt-1 text-sm text-slate-400">
                        {mentor.company}
                      </p>
                    )}

                  </div>

                </div>

                {mentor.rating > 0 && (
                  <p className="mt-3 text-sm text-yellow-400">
                    ★{" "}
                    {mentor.rating.toFixed(
                      1
                    )}

                    <span className="ml-1 text-slate-500">
                      (
                      {
                        mentor.total_reviews
                      }{" "}
                      reviews)
                    </span>
                  </p>
                )}

              </div>
            )}

            {/* SELECTED SESSION */}

            <div className="border-b border-slate-800 py-5">

              <p className="text-sm text-slate-500">
                Selected Session
              </p>

              {selectedSlot ? (
                <div className="mt-3">

                  <p className="font-medium">
                    {formatDate(
                      selectedSlot.available_date
                    )}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">

                    <Clock
                      size={15}
                    />

                    <span>
                      {formatTime(
                        selectedSlot.start_time
                      )}
                    </span>

                    <span>
                      -
                    </span>

                    <span>
                      {formatTime(
                        selectedSlot.end_time
                      )}
                    </span>

                  </div>

                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Select a time slot
                </p>
              )}

            </div>

            {/* NOTES */}

            <div className="py-5">

              <label
                htmlFor="booking-notes"
                className="mb-2 block text-sm text-slate-400"
              >
                Notes for Mentor
              </label>

              <textarea
                id="booking-notes"
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                maxLength={2000}
                rows={5}
                placeholder="Tell the mentor what you want help with..."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-blue-500"
              />

              <p className="mt-1 text-right text-xs text-slate-600">
                {notes.length}/2000
              </p>

            </div>

            {/* PRICE */}

            <div className="flex items-center justify-between border-t border-slate-800 py-4">

              <span className="text-slate-400">
                Session Price
              </span>

              <span className="text-xl font-bold">
                ₹
                {Number(
                  mentor?.price || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            {/* BOOK BUTTON */}

            <button
              type="button"
              disabled={
                !selectedSlot ||
                booking ||
                !mentor
              }
              onClick={handleBooking}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >

              {booking ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Confirming Booking...
                </>
              ) : (
                <>
                  <CheckCircle
                    size={18}
                  />

                  Confirm Booking
                </>
              )}

            </button>

            {/* PAYMENT MESSAGE */}

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3">

              <p className="text-center text-xs leading-5 text-slate-500">
                Payment is currently not required.
                Your mentoring session will be confirmed
                immediately.
              </p>

            </div>

          </section>

        </div>

        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">

          <div className="flex gap-4">

            <CheckCircle
              size={22}
              className="mt-0.5 shrink-0 text-blue-400"
            />

            <div>

              <h3 className="font-semibold text-blue-300">
                Booking Information
              </h3>

              <ul className="mt-2 space-y-1 text-sm text-slate-400">

                <li>
                  • Select one available session.
                </li>

                <li>
                  • Add optional notes for your mentor.
                </li>

                <li>
                  • Confirming a booking reserves that
                  availability slot.
                </li>

                <li>
                  • Payment integration is currently paused.
                </li>

              </ul>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}