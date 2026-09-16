"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquare,
  Pencil,
  Star,
  Users,
  XCircle,
  ArrowRight,
  UserRound,
  Briefcase,
  GraduationCap,
} from "lucide-react";

import api from "@/services/api";
import {
  getApiErrorMessage,
} from "@/services/apiError";

/* ============================================================================
   TYPES
   ============================================================================ */

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

  photo_url: string | null;

  is_approved: boolean;
  is_active: boolean;

  rating: number;
  total_reviews: number;
}

interface Booking {
  id: number;
  mentor_id: number;
  user_id: number;

  start_time?: string;
  end_time?: string;

  booking_date?: string;
  start_at?: string;
  end_at?: string;

  status?: string;
  payment_status?: string;

  notes?: string | null;

  created_at?: string;
}

interface BookingListResponse {
  items?: Booking[];
  bookings?: Booking[];
  total?: number;
}

/* ============================================================================
   HELPERS
   ============================================================================ */

function getBookingStart(
  booking: Booking
): string {
  return (
    booking.start_time ||
    booking.start_at ||
    booking.booking_date ||
    ""
  );
}

function getBookingEnd(
  booking: Booking
): string {
  return (
    booking.end_time ||
    booking.end_at ||
    ""
  );
}

function formatDate(
  value?: string
): string {
  if (!value) {
    return "Date not available";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(
  value?: string
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function getStatusClass(
  status?: string
): string {
  switch (
    status?.toLowerCase()
  ) {
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-400";

    case "completed":
      return "bg-blue-500/10 text-blue-400";

    case "cancelled":
    case "canceled":
      return "bg-red-500/10 text-red-400";

    case "pending":
      return "bg-amber-500/10 text-amber-400";

    default:
      return "bg-slate-800 text-slate-400";
  }
}

function normalizeBookings(
  data: BookingListResponse | Booking[]
): Booking[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.bookings)) {
    return data.bookings;
  }

  return [];
}

/* ============================================================================
   PAGE
   ============================================================================ */

export default function MentorDashboardPage() {
  const router = useRouter();

  const [mentor, setMentor] =
    useState<Mentor | null>(null);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ==========================================================================
     LOAD DASHBOARD
     ========================================================================== */

  const loadDashboard =
    async () => {
      try {
        setLoading(true);
        setError("");

        /* ---------------------------------------------------------------
           Mentor profile
           --------------------------------------------------------------- */

        const mentorResponse =
          await api.get<Mentor>(
            "/mentors/me"
          );

        setMentor(
          mentorResponse.data
        );

        /* ---------------------------------------------------------------
           Mentor bookings
           
           The dashboard tries the authenticated booking endpoint.
           If the endpoint returns 404, the profile still loads normally.
           --------------------------------------------------------------- */

        try {
          const bookingResponse =
            await api.get<
              BookingListResponse |
              Booking[]
            >("/bookings/mentor");

          setBookings(
            normalizeBookings(
              bookingResponse.data
            )
          );
        } catch (bookingError) {
          const status =
            (
              bookingError as {
                response?: {
                  status?: number;
                };
              }
            )?.response?.status;

          /*
           * A missing booking endpoint should not
           * break the mentor dashboard.
           */

          if (status !== 404) {
            console.error(
              "Failed to load mentor bookings:",
              bookingError
            );
          }

          setBookings([]);
        }
      } catch (err) {
        console.error(
          "Failed to load mentor dashboard:",
          err
        );

        const status =
          (
            err as {
              response?: {
                status?: number;
              };
            }
          )?.response?.status;

        if (status === 404) {
          router.push(
            "/mentor/onboarding"
          );
          return;
        }

        setError(
          getApiErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    };

  /* ==========================================================================
     INITIAL LOAD
     ========================================================================== */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ==========================================================================
     BOOKING CALCULATIONS
     ========================================================================== */

  const now =
    // eslint-disable-next-line react-hooks/purity
    Date.now();

  const upcomingBookings =
    bookings
      .filter((booking) => {
        const start =
          new Date(
            getBookingStart(
              booking
            )
          ).getTime();

        return (
          !Number.isNaN(start) &&
          start >= now &&
          booking.status !==
            "cancelled" &&
          booking.status !==
            "canceled"
        );
      })
      .sort((a, b) => {
        return (
          new Date(
            getBookingStart(a)
          ).getTime() -
          new Date(
            getBookingStart(b)
          ).getTime()
        );
      });

  const completedBookings =
    bookings.filter(
      (booking) =>
        booking.status?.toLowerCase() ===
        "completed"
    );

  const cancelledBookings =
    bookings.filter(
      (booking) =>
        booking.status?.toLowerCase() ===
          "cancelled" ||
        booking.status?.toLowerCase() ===
          "canceled"
    );

  const confirmedBookings =
    bookings.filter(
      (booking) =>
        booking.status?.toLowerCase() ===
        "confirmed"
    );

  /* ==========================================================================
     LOADING
     ========================================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="text-center">

            <Loader2
              size={40}
              className="mx-auto animate-spin text-indigo-500"
            />

            <p className="mt-4 text-sm text-slate-400">
              Loading mentor dashboard...
            </p>

          </div>

        </div>

      </main>
    );
  }

  /* ==========================================================================
     ERROR
     ========================================================================== */

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">

        <div className="mx-auto max-w-2xl">

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">

            <XCircle
              size={42}
              className="mx-auto text-red-400"
            />

            <h1 className="mt-4 text-xl font-bold">
              Unable to load dashboard
            </h1>

            <p className="mt-2 text-sm text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold hover:bg-indigo-500"
            >
              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }

  /* ==========================================================================
     FALLBACK
     ========================================================================== */

  if (!mentor) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">

        <div className="mx-auto max-w-2xl text-center">

          <UserRound
            size={42}
            className="mx-auto text-slate-500"
          />

          <h1 className="mt-4 text-xl font-bold">
            Mentor profile not found
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/mentor/onboarding"
              )
            }
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold hover:bg-indigo-500"
          >
            Complete Onboarding
          </button>

        </div>

      </main>
    );
  }

  /* ==========================================================================
     MAIN DASHBOARD
     ========================================================================== */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ==================================================================
            HEADER
            ================================================================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-sm font-medium text-indigo-400">
              Mentor Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Welcome back
              {mentor.title
                ? `, ${mentor.title}`
                : ""}
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage your profile, bookings and
              mentoring sessions.
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/mentor/profile"
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
            >
              <Pencil size={16} />
              Edit Profile
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/mentor/dashboard/bookings"
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <CalendarDays size={16} />
              View Bookings
            </button>

          </div>

        </div>

        {/* ==================================================================
            PROFILE STATUS
            ================================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={
              <CalendarDays
                size={20}
              />
            }
            label="Total Bookings"
            value={bookings.length}
          />

          <StatCard
            icon={
              <Clock3 size={20} />
            }
            label="Upcoming"
            value={
              upcomingBookings.length
            }
          />

          <StatCard
            icon={
              <CheckCircle2
                size={20}
              />
            }
            label="Completed"
            value={
              completedBookings.length
            }
          />

          <StatCard
            icon={
              <Star
                size={20}
              />
            }
            label="Rating"
            value={Number(
              mentor.rating || 0
            ).toFixed(1)}
            suffix="/ 5"
          />

        </div>

        {/* ==================================================================
            APPROVAL BANNER
            ================================================================== */}

        {!mentor.is_approved && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <Clock3
                size={22}
                className="mt-0.5 shrink-0 text-amber-400"
              />

              <div>

                <h2 className="font-semibold text-amber-300">
                  Profile approval pending
                </h2>

                <p className="mt-1 text-sm text-amber-200/70">
                  Your mentor profile is waiting for
                  administrator approval.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/mentor/profile"
                )
              }
              className="shrink-0 rounded-xl border border-amber-500/30 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/10"
            >
              View Profile
            </button>

          </div>
        )}

        {/* ==================================================================
            TWO COLUMN AREA
            ================================================================== */}

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* =================================================================
              UPCOMING BOOKINGS
              ================================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900">

            <div className="flex items-center justify-between border-b border-slate-800 p-6">

              <div>

                <h2 className="font-bold">
                  Upcoming Sessions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your next mentoring sessions
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/mentor/dashboard/bookings"
                  )
                }
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                View All
                <ArrowRight
                  size={15}
                />
              </button>

            </div>

            <div className="p-6">

              {upcomingBookings.length ===
              0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">

                  <CalendarDays
                    size={35}
                    className="mx-auto text-slate-600"
                  />

                  <h3 className="mt-4 font-semibold text-slate-300">
                    No upcoming sessions
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    New bookings will appear here.
                  </p>

                </div>
              ) : (
                <div className="space-y-3">

                  {upcomingBookings
                    .slice(0, 5)
                    .map(
                      (
                        booking
                      ) => (
                        <BookingRow
                          key={
                            booking.id
                          }
                          booking={
                            booking
                          }
                        />
                      )
                    )}

                </div>
              )}

            </div>

          </section>

          {/* =================================================================
              PROFILE OVERVIEW
              ================================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <h2 className="font-bold">
                Profile Overview
              </h2>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/mentor/profile"
                  )
                }
                className="text-indigo-400 hover:text-indigo-300"
                aria-label="Edit profile"
              >
                <Pencil
                  size={17}
                />
              </button>

            </div>

            <div className="mt-6 space-y-5">

              <ProfileItem
                icon={
                  <Briefcase
                    size={17}
                  />
                }
                label="Company"
                value={
                  mentor.company ||
                  "Not provided"
                }
              />

              <ProfileItem
                icon={
                  <UserRound
                    size={17}
                  />
                }
                label="Experience"
                value={
                  mentor.experience ||
                  "Not provided"
                }
              />

              <ProfileItem
                icon={
                  <GraduationCap
                    size={17}
                  />
                }
                label="Education"
                value={
                  mentor.education ||
                  "Not provided"
                }
              />

              <ProfileItem
                icon={
                  <Users
                    size={17}
                  />
                }
                label="Reviews"
                value={String(
                  mentor.total_reviews ||
                    0
                )}
              />

            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/mentor/profile"
                )
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              Manage Profile
              <ArrowRight
                size={16}
              />
            </button>

          </section>

        </div>

        {/* ==================================================================
            BOOKING SUMMARY
            ================================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">

            <h2 className="font-bold">
              Booking Overview
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current booking activity
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            <SummaryCard
              icon={
                <CheckCircle2
                  size={20}
                />
              }
              label="Confirmed"
              value={
                confirmedBookings.length
              }
            />

            <SummaryCard
              icon={
                <CheckCircle2
                  size={20}
                />
              }
              label="Completed"
              value={
                completedBookings.length
              }
            />

            <SummaryCard
              icon={
                <XCircle
                  size={20}
                />
              }
              label="Cancelled"
              value={
                cancelledBookings.length
              }
            />

          </div>

        </section>

        {/* ==================================================================
            QUICK ACTIONS
            ================================================================== */}

        <section className="mt-6">

          <h2 className="mb-4 font-bold">
            Quick Actions
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <QuickAction
              icon={
                <Pencil
                  size={21}
                />
              }
              title="Edit Profile"
              description="Update your professional information"
              onClick={() =>
                router.push(
                  "/mentor/profile"
                )
              }
            />

            <QuickAction
              icon={
                <CalendarDays
                  size={21}
                />
              }
              title="Availability"
              description="Manage your mentoring availability"
              onClick={() =>
                router.push(
                  "/mentor/dashboard/availability"
                )
              }
            />

            <QuickAction
              icon={
                <CalendarDays
                  size={21}
                />
              }
              title="Bookings"
              description="View and manage student bookings"
              onClick={() =>
                router.push(
                  "/mentor/dashboard/bookings"
                )
              }
            />

            <QuickAction
              icon={
                <MessageSquare
                  size={21}
                />
              }
              title="Reviews"
              description="View feedback from students"
              onClick={() =>
                router.push(
                  `/mentors/${mentor.id}`
                )
              }
            />

          </div>

        </section>

      </div>

    </main>
  );
}

/* ============================================================================
   STAT CARD
   ============================================================================ */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          {icon}
        </div>

      </div>

      <div className="mt-5">

        <div className="text-2xl font-bold">
          {value}
          {suffix && (
            <span className="ml-1 text-sm font-normal text-slate-500">
              {suffix}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-slate-500">
          {label}
        </p>

      </div>

    </div>
  );
}

/* ============================================================================
   BOOKING ROW
   ============================================================================ */

interface BookingRowProps {
  booking: Booking;
}

function BookingRow({
  booking,
}: BookingRowProps) {
  const start =
    getBookingStart(
      booking
    );

  const end =
    getBookingEnd(
      booking
    );

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <CalendarDays
            size={20}
          />
        </div>

        <div>

          <p className="font-semibold text-slate-200">
            Mentoring Session
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">

            <span>
              {formatDate(start)}
            </span>

            {formatTime(start) && (
              <span>
                {formatTime(start)}
                {end &&
                  ` - ${formatTime(
                    end
                  )}`}
              </span>
            )}

          </div>

        </div>

      </div>

      <span
        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
          booking.status
        )}`}
      >
        {booking.status ||
          "Confirmed"}
      </span>

    </div>
  );
}

/* ============================================================================
   PROFILE ITEM
   ============================================================================ */

interface ProfileItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function ProfileItem({
  icon,
  label,
  value,
}: ProfileItemProps) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-0.5 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-1 wrap-break-word text-sm font-medium text-slate-300">
          {value}
        </p>

      </div>

    </div>
  );
}

/* ============================================================================
   SUMMARY CARD
   ============================================================================ */

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function SummaryCard({
  icon,
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-5">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
        {icon}
      </div>

      <div>

        <p className="text-2xl font-bold">
          {value}
        </p>

        <p className="text-xs text-slate-500">
          {label}
        </p>

      </div>

    </div>
  );
}

/* ============================================================================
   QUICK ACTION
   ============================================================================ */

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-slate-700 hover:bg-slate-800/80"
    >

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          {icon}
        </div>

        <ArrowRight
          size={17}
          className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-slate-300"
        />

      </div>

      <h3 className="mt-5 font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </button>
  );
}