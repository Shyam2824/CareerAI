"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  MessageSquare,
  Star,
} from "lucide-react";

import api from "@/services/api";

interface Review {
  id: number;
  user_id: number;
  mentor_id: number;
  booking_id: number;
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
}

interface MentorReviewsProps {
  mentorId: number;
}

export default function MentorReviews({
  mentorId,
}: MentorReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(
    []
  );

  const [avg, setAvg] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [reviewsResponse, ratingResponse] =
        await Promise.all([
          api.get<Review[]>(
            `/mentor-reviews/mentor/${mentorId}`
          ),

          api.get(
            `/mentor-reviews/mentor/${mentorId}/rating`
          ),
        ]);

      setReviews(reviewsResponse.data || []);

      setAvg(
        Number(
          ratingResponse.data?.average_rating || 0
        )
      );

      setTotal(
        Number(
          ratingResponse.data?.total_reviews || 0
        )
      );
    } catch (error) {
      console.error(
        "Failed to load mentor reviews:",
        error
      );

      setError(
        "Unable to load reviews. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [mentorId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  /* =========================
     LOADING STATE
  ========================= */

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2
          className="animate-spin text-slate-400"
          size={24}
        />
      </div>
    );
  }

  /* =========================
     MAIN SECTION
  ========================= */

  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white">
      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Reviews & Ratings
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Feedback from students.
          </p>
        </div>

        <MessageSquare
          className="text-slate-500"
          size={22}
        />
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* =========================
          RATING SUMMARY
      ========================= */}

      <div className="mb-8 flex items-center gap-5 rounded-xl bg-slate-950 p-5">
        <div>
          <div className="text-4xl font-bold">
            {avg.toFixed(1)}
          </div>

          <div className="mt-1 flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(avg)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-sm text-slate-400">
          Based on{" "}
          <b className="text-white">
            {total}
          </b>{" "}
          {total === 1 ? "review" : "reviews"}
        </div>
      </div>

      {/* =========================
          REVIEWS
      ========================= */}

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
          <MessageSquare
            className="mx-auto mb-3 text-slate-600"
            size={24}
          />

          <p className="font-medium text-slate-300">
            No reviews yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Be the first student to leave a review.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-slate-800 pb-5 last:border-0 last:pb-0"
            >
              {/* Review Header */}

              <div className="flex items-center justify-between gap-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <=
                          Math.round(
                            review.rating
                          )
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-700"
                        }`}
                      />
                    )
                  )}
                </div>

                <span className="text-xs text-slate-500">
                  {new Date(
                    review.created_at
                  ).toLocaleDateString()}
                </span>
              </div>

              {/* Review Text */}

              {review.review && (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {review.review}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}