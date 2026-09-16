"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Edit3,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
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

interface AvailabilityForm {
  available_date: string;
  start_time: string;
  end_time: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string | Array<{ msg?: string }>;
    };
  };
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const apiError = error as ApiErrorResponse;
    const detail = apiError.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item.msg || "")
        .filter(Boolean)
        .join(", ");
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MentorAvailabilityPage() {
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [showForm, setShowForm] = useState<boolean>(false);

  const [editingSlot, setEditingSlot] =
    useState<Availability | null>(null);

  const [form, setForm] =
    useState<AvailabilityForm>({
      available_date: "",
      start_time: "10:00",
      end_time: "11:00",
    });

  /* =======================================================
     LOAD AVAILABILITY
  ======================================================= */

  const loadAvailability = useCallback(
    async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<Availability[]>(
            "/mentor-availability/my"
          );

        setSlots(response.data || []);
      } catch (error: unknown) {
        console.error(
          "Failed to load availability:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load your availability."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAvailability();
  }, [loadAvailability]);

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = (): void => {
    setForm({
      available_date: "",
      start_time: "10:00",
      end_time: "11:00",
    });

    setEditingSlot(null);
    setShowForm(false);
  };

  /* =======================================================
     ADD FORM
  ======================================================= */

  const openAddForm = (): void => {
    setError("");
    setSuccess("");

    setEditingSlot(null);

    setForm({
      available_date: "",
      start_time: "10:00",
      end_time: "11:00",
    });

    setShowForm(true);
  };

  /* =======================================================
     EDIT FORM
  ======================================================= */

  const openEditForm = (
    slot: Availability
  ): void => {
    setError("");
    setSuccess("");

    setEditingSlot(slot);

    setForm({
      available_date: slot.available_date,
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
    });

    setShowForm(true);
  };

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  const updateForm = (
    field: keyof AvailabilityForm,
    value: string
  ): void => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     CREATE / UPDATE
  ======================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.available_date) {
      setError("Please select a date.");
      return;
    }

    if (!form.start_time || !form.end_time) {
      setError(
        "Please select start and end time."
      );
      return;
    }

    if (
      form.start_time >= form.end_time
    ) {
      setError(
        "End time must be after start time."
      );
      return;
    }

    try {
      setSaving(true);

      if (editingSlot) {
        await api.put(
          `/mentor-availability/${editingSlot.id}`,
          {
            available_date:
              form.available_date,
            start_time:
              form.start_time,
            end_time:
              form.end_time,
          }
        );

        setSuccess(
          "Availability slot updated successfully."
        );
      } else {
        await api.post(
          "/mentor-availability",
          {
            available_date:
              form.available_date,
            start_time:
              form.start_time,
            end_time:
              form.end_time,
          }
        );

        setSuccess(
          "Availability slot added successfully."
        );
      }

      resetForm();

      await loadAvailability();
    } catch (error: unknown) {
      console.error(
        "Availability save error:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Unable to save availability."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (
    slot: Availability
  ): Promise<void> => {
    if (slot.is_booked) {
      setError(
        "Booked availability cannot be deleted."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete availability on ${formatDate(
        slot.available_date
      )} from ${formatTime(
        slot.start_time
      )} to ${formatTime(
        slot.end_time
      )}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/mentor-availability/${slot.id}`
      );

      setSuccess(
        "Availability slot deleted successfully."
      );

      await loadAvailability();
    } catch (error: unknown) {
      console.error(
        "Delete availability error:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Unable to delete availability."
        )
      );
    }
  };

  /* =======================================================
     DATE FORMAT
  ======================================================= */

  const formatDate = (
    date: string
  ): string => {
    try {
      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  /* =======================================================
     TIME FORMAT
  ======================================================= */

  const formatTime = (
    time: string
  ): string => {
    try {
      const [hours, minutes] =
        time.split(":");

      const date = new Date();

      date.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
      );

      return date.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return time;
    }
  };

  /* =======================================================
     COUNTS
  ======================================================= */

  const availableSlots =
    slots.filter(
      (slot) => !slot.is_booked
    );

  const bookedSlots =
    slots.filter(
      (slot) => slot.is_booked
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            size={36}
            className="mx-auto animate-spin text-purple-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading availability...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <Link
              href="/mentor/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-purple-600"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-slate-900">
              Manage Availability
            </h1>

            <p className="mt-2 text-slate-500">
              Set the dates and times when students can
              book mentoring sessions with you.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            <Plus size={19} />
            Add Availability
          </button>
        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle2 size={20} />

            <p className="text-sm font-medium">
              {success}
            </p>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="ml-auto"
              aria-label="Close success message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} />

            <p className="text-sm font-medium">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="ml-auto"
              aria-label="Close error message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mt-8 grid gap-5 md:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                <CalendarDays size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Total Slots
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {slots.length}
                </p>
              </div>

            </div>
          </div>

          {/* AVAILABLE */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Clock size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Available
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {availableSlots.length}
                </p>
              </div>

            </div>
          </div>

          {/* BOOKED */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Booked
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {bookedSlots.length}
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}

        {showForm && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingSlot
                    ? "Edit Availability"
                    : "Add Availability"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose a date and mentoring time.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close form"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6"
            >

              <div className="grid gap-5 md:grid-cols-3">

                {/* DATE */}

                <div>
                  <label
                    htmlFor="available_date"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Available Date
                  </label>

                  <input
                    id="available_date"
                    type="date"
                    value={
                      form.available_date
                    }
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(event) =>
                      updateForm(
                        "available_date",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    required
                  />
                </div>

                {/* START TIME */}

                <div>
                  <label
                    htmlFor="start_time"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Start Time
                  </label>

                  <input
                    id="start_time"
                    type="time"
                    value={
                      form.start_time
                    }
                    onChange={(event) =>
                      updateForm(
                        "start_time",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    required
                  />
                </div>

                {/* END TIME */}

                <div>
                  <label
                    htmlFor="end_time"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    End Time
                  </label>

                  <input
                    id="end_time"
                    type="time"
                    value={
                      form.end_time
                    }
                    onChange={(event) =>
                      updateForm(
                        "end_time",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    required
                  />
                </div>

              </div>

              {/* FORM BUTTONS */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />

                      {editingSlot
                        ? "Update Slot"
                        : "Add Slot"}
                    </>
                  )}
                </button>

              </div>
            </form>
          </div>
        )}

        {/* =================================================
            AVAILABILITY LIST
        ================================================= */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Your Availability
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Students can book your available slots.
            </p>
          </div>

          {slots.length === 0 ? (

            /* EMPTY STATE */

            <div className="mt-8 rounded-xl bg-slate-50 p-10 text-center">

              <CalendarDays
                size={42}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-4 text-lg font-semibold text-slate-700">
                No availability added
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Add your first availability slot so students
                can book mentoring sessions with you.
              </p>

              <button
                type="button"
                onClick={openAddForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
              >
                <Plus size={18} />
                Add Availability
              </button>

            </div>

          ) : (

            /* SLOT LIST */

            <div className="mt-6 space-y-4">

              {slots.map(
                (slot: Availability) => (
                  <div
                    key={slot.id}
                    className="flex flex-col justify-between gap-5 rounded-xl border border-slate-100 bg-slate-50 p-5 md:flex-row md:items-center"
                  >

                    {/* SLOT INFO */}

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                        <CalendarDays size={22} />
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">
                          {formatDate(
                            slot.available_date
                          )}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">

                          <Clock size={15} />

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

                    </div>

                    {/* STATUS / ACTIONS */}

                    <div className="flex flex-wrap items-center gap-3">

                      {slot.is_booked ? (

                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                          <CheckCircle2 size={14} />
                          Booked
                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          <Clock size={14} />
                          Available
                        </span>

                      )}

                      {!slot.is_booked && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                slot
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <Edit3 size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                slot
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </>
                      )}

                    </div>
                  </div>
                )
              )}

            </div>
          )}
        </div>

        {/* =================================================
            TIPS
        ================================================= */}

        <div className="mt-8 rounded-2xl border border-purple-100 bg-purple-50 p-6">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Clock size={20} />
            </div>

            <div>
              <h3 className="font-bold text-purple-900">
                Availability Tips
              </h3>

              <ul className="mt-2 space-y-1 text-sm text-purple-800">
                <li>
                  • Add multiple slots to increase your chances
                  of getting bookings.
                </li>

                <li>
                  • Make sure your availability matches your
                  actual mentoring schedule.
                </li>

                <li>
                  • Booked slots cannot be edited or deleted.
                </li>

                <li>
                  • Students will only see available slots from
                  approved active mentors.
                </li>
              </ul>
            </div>

          </div>
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