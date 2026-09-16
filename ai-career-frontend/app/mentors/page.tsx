"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Star,
  Briefcase,
  SlidersHorizontal,
  X,
} from "lucide-react";
import  api from "@/services/api";

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
  created_at: string;
  updated_at: string;
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
    const apiError = error as ApiErrorResponse;

    return (
      apiError.response?.data?.detail ||
      "Unable to load mentors."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load mentors.";
}

export default function MentorsPage() {
  const router = useRouter();

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [search, setSearch] = useState<string>("");
  const [skill, setSkill] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rating");

  const [showFilters, setShowFilters] = useState<boolean>(false);

  /*
   * Fetch mentors
   */
  const fetchMentors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (skill.trim()) {
        params.append("skill", skill.trim());
      }

      if (minRating) {
        params.append("min_rating", minRating);
      }

      if (maxPrice) {
        params.append("max_price", maxPrice);
      }

      if (sortBy) {
        params.append("sort_by", sortBy);
      }

      const query = params.toString();

      const endpoint = query
        ? `/mentors/?${query}`
        : "/mentors/";

      const response = await api.get<Mentor[]>(endpoint);

      setMentors(response.data);
    } catch (err: unknown) {
      console.error("Failed to fetch mentors:", err);

      setError(getErrorMessage(err));
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    skill,
    minRating,
    maxPrice,
    sortBy,
  ]);

  /*
   * Load mentors when filters change
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMentors();
  }, [fetchMentors]);

  /*
   * Search button
   */
  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    fetchMentors();
  };

  /*
   * Clear filters
   */
  const clearFilters = () => {
    setSearch("");
    setSkill("");
    setMinRating("");
    setMaxPrice("");
    setSortBy("rating");
  };

  const hasFilters =
    search.trim() !== "" ||
    skill.trim() !== "" ||
    minRating !== "" ||
    maxPrice !== "" ||
    sortBy !== "rating";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* ================= HEADER ================= */}

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            Find a Mentor
          </h1>

          <p className="text-slate-400 mt-2">
            Learn from experienced professionals and
            accelerate your career.
          </p>
        </div>

        {/* ================= SEARCH ================= */}

        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search by skill, company, title..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() =>
              setShowFilters((previous) => !previous)
            }
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-900 transition"
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </form>

        {/* ================= FILTERS ================= */}

        {showFilters && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* Skill */}

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Skill
                </label>

                <input
                  type="text"
                  placeholder="Python, ML..."
                  value={skill}
                  onChange={(event) =>
                    setSkill(event.target.value)
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Rating */}

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Minimum Rating
                </label>

                <select
                  value={minRating}
                  onChange={(event) =>
                    setMinRating(event.target.value)
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Any rating
                  </option>

                  <option value="4">
                    4+ ⭐
                  </option>

                  <option value="4.5">
                    4.5+ ⭐
                  </option>
                </select>
              </div>

              {/* Price */}

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Maximum Price
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="₹1000"
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(event.target.value)
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Sort */}

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Sort By
                </label>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                >
                  <option value="rating">
                    Highest Rated
                  </option>

                  <option value="price_low">
                    Price: Low to High
                  </option>

                  <option value="price_high">
                    Price: High to Low
                  </option>

                  <option value="reviews">
                    Most Reviews
                  </option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* ================= RESULT COUNT ================= */}

        {!loading && !error && (
          <div className="mb-5 text-sm text-slate-400">
            {mentors.length} mentor
            {mentors.length !== 1 ? "s" : ""} found
          </div>
        )}

        {/* ================= LOADING ================= */}

        {loading && (
          <div className="text-center py-20">
            <div className="text-slate-400">
              Loading mentors...
            </div>
          </div>
        )}

        {/* ================= ERROR ================= */}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-300">
            <p className="font-medium">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchMentors}
              className="mt-4 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ================= NO RESULTS ================= */}

        {!loading &&
          !error &&
          mentors.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold">
                No mentors found
              </h2>

              <p className="text-slate-400 mt-2">
                Try changing your search or filters.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

        {/* ================= MENTOR GRID ================= */}

        {!loading &&
          !error &&
          mentors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition"
                >

                  {/* Title */}

                  <h2 className="text-xl font-semibold">
                    {mentor.title || "Career Mentor"}
                  </h2>

                  {/* Company */}

                  {mentor.company && (
                    <p className="text-slate-400 mt-1">
                      {mentor.company}
                    </p>
                  )}

                  {/* Rating */}

                  <div className="flex items-center gap-2 mt-4">
                    <Star
                      size={17}
                      className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="font-medium">
                      {mentor.rating.toFixed(1)}
                    </span>

                    <span className="text-slate-500 text-sm">
                      ({mentor.total_reviews} reviews)
                    </span>
                  </div>

                  {/* Experience */}

                  {mentor.experience && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-slate-400">
                      <Briefcase size={16} />
                      {mentor.experience}
                    </div>
                  )}

                  {/* Bio */}

                  {mentor.bio && (
                    <p className="text-slate-400 text-sm mt-4 line-clamp-3">
                      {mentor.bio}
                    </p>
                  )}

                  {/* Skills */}

                  {mentor.skills && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {mentor.skills
                        .split(",")
                        .map((item) => item.trim())
                        .filter(
                          (item) => item.length > 0
                        )
                        .slice(0, 5)
                        .map((item, index) => (
                          <span
                            key={`${mentor.id}-${index}`}
                            className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md"
                          >
                            {item}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Price */}

                  <div className="mt-5">
                    <span className="text-xl font-bold">
                      ₹{mentor.price}
                    </span>

                    <span className="text-sm text-slate-500">
                      /session
                    </span>
                  </div>

                  {/* View Mentor */}

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/mentors/${mentor.id}`
                      )
                    }
                    className="w-full mt-5 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-medium transition"
                  >
                    View Mentor
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>
    </main>
  );
}