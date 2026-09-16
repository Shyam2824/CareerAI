"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Crown,
  Loader2,
  Sparkles,
} from "lucide-react";

import  api  from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface Subscription {
  plan_name: string;
  status: string;
  price: number;
}

interface Usage {
  resume_analysis_count: number;
  interview_count: number;
  question_count: number;
  voice_interview_count: number;
}

interface MembershipStatus {
  subscription: Subscription;
  usage: Usage;
  is_premium: boolean;
}

interface PaymentOrder {
  payment_id: number;
  order_id: string;
  amount: number;
  amount_paise: number;
  currency: string;
  plan_name: string;
  status: string;
  razorpay_key_id: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  notes: {
    user_id: string;
    plan_name: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => Promise<void>;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

export default function PricingPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [membership, setMembership] =
    useState<MembershipStatus | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [upgrading, setUpgrading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD MEMBERSHIP
  // =====================================================

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    // eslint-disable-next-line react-hooks/immutability
    loadMembership();
  }, [user, authLoading]);

  const loadMembership = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<MembershipStatus>(
          "/subscriptions/status"
        );

      setMembership(response.data);
    } catch (err: unknown) {
      console.error(
        "Failed to load membership:",
        err
      );

      setError(
        "Unable to load membership information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD RAZORPAY SCRIPT
  // =====================================================

  const loadRazorpayScript =
    (): Promise<boolean> => {
      return new Promise((resolve) => {
        if (
          document.getElementById(
            "razorpay-checkout"
          )
        ) {
          resolve(true);
          return;
        }

        const script =
          document.createElement("script");

        script.id =
          "razorpay-checkout";

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        script.onload = () => {
          resolve(true);
        };

        script.onerror = () => {
          resolve(false);
        };

        document.body.appendChild(script);
      });
    };

  // =====================================================
  // UPGRADE TO PREMIUM
  // =====================================================

  const handleUpgrade = async () => {
    // User must login first
    if (!user) {
      router.push(
        "/login?redirect=/pricing"
      );
      return;
    }

    try {
      setUpgrading(true);
      setError("");

      // -------------------------------------------------
      // 1. Load Razorpay
      // -------------------------------------------------

      const loaded =
        await loadRazorpayScript();

      if (!loaded) {
        throw new Error(
          "Unable to load Razorpay Checkout."
        );
      }

      // -------------------------------------------------
      // 2. Create order on backend
      // -------------------------------------------------

      const orderResponse =
        await api.post<PaymentOrder>(
          "/payments/create-order",
          {
            plan_name: "premium",
          }
        );

      const order =
        orderResponse.data;

      console.log(
        "Razorpay order created:",
        order
      );

      // -------------------------------------------------
      // 3. Check Razorpay
      // -------------------------------------------------

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout is not available."
        );
      }

      // -------------------------------------------------
      // 4. Razorpay Checkout options
      // -------------------------------------------------

      const options: RazorpayOptions = {
        key: order.razorpay_key_id,

        amount: order.amount_paise,

        currency: order.currency,

        name: "CareerAI",

        description:
          "CareerAI Premium Membership",

        order_id: order.order_id,

        prefill: {
          name: user.name,
          email: user.email,
        },

        notes: {
          user_id: String(user.id),
          plan_name: "premium",
        },

        theme: {
          color: "#000000",
        },

        // ------------------------------------------------
        // 5. Razorpay success callback
        // ------------------------------------------------

        handler: async (
          response: RazorpayResponse
        ) => {
          try {
            console.log(
              "Razorpay payment successful:",
              response
            );

            // --------------------------------------------
            // 6. Verify payment on backend
            // --------------------------------------------

            await api.post(
              "/payments/verify",
              {
                payment_id:
                  order.payment_id,

                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,
              }
            );

            // --------------------------------------------
            // 7. Reload membership
            // --------------------------------------------

            await loadMembership();

            // --------------------------------------------
            // 8. Success
            // --------------------------------------------

            alert(
              "Payment successful! Premium membership activated."
            );

            router.push(
              "/dashboard"
            );
          } catch (err: unknown) {
            console.error(
              "Payment verification failed:",
              err
            );

            setError(
              "Payment was completed, but verification failed. Please contact support."
            );

            setUpgrading(false);
          }
        },

        // ------------------------------------------------
        // User closes Razorpay
        // ------------------------------------------------

        modal: {
          ondismiss: () => {
            setUpgrading(false);
          },
        },
      };

      // -------------------------------------------------
      // 9. Open Razorpay
      // -------------------------------------------------

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.open();
    } catch (err: unknown) {
      console.error(
        "Unable to start payment:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start payment. Please try again."
      );

      setUpgrading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading ||
    authLoading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2
          className="animate-spin"
          size={32}
        />
      </main>
    );
  }

  // =====================================================
  // PREMIUM STATUS
  // =====================================================

  const isPremium =
    membership?.is_premium ?? false;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mx-auto max-w-2xl text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
            <Sparkles size={16} />

            CareerAI Premium
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Choose the plan that fits your career goals
          </h1>

          <p className="mt-4 text-gray-600">
            Start free and upgrade when you need
            advanced career tools.
          </p>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            PRICING
        ================================================= */}

        <div className="mt-12 grid gap-8 md:grid-cols-2">

          {/* =================================================
              FREE PLAN
          ================================================= */}

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Free
                </h2>

                <p className="mt-2 text-gray-600">
                  Get started with essential
                  career tools.
                </p>
              </div>

            </div>

            <div className="mt-8">

              <span className="text-5xl font-bold text-gray-900">
                ₹0
              </span>

              <span className="ml-2 text-gray-500">
                /month
              </span>

            </div>

            <div className="mt-8 space-y-4">

              <Feature text="3 Resume Analyses" />

              <Feature text="Basic ATS Analysis" />

              <Feature text="500 Basic Questions" />

              <Feature text="5 Voice Interviews" />

              <Feature text="Basic Interview Practice" />

            </div>

            <button
              disabled
              className="mt-10 w-full rounded-xl border border-gray-300 bg-gray-100 px-5 py-3 font-semibold text-gray-600"
            >
              {isPremium
                ? "Free Plan"
                : "Current Plan"}
            </button>

          </div>

          {/* =================================================
              PREMIUM PLAN
          ================================================= */}

          <div className="relative rounded-3xl border-2 border-yellow-400 bg-white p-8 shadow-xl">

            {/* BADGE */}

            <div className="absolute -top-4 left-1/2 -translate-x-1/2">

              <div className="flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2 text-sm font-bold text-gray-900 shadow">

                <Crown size={16} />

                MOST POPULAR

              </div>

            </div>

            {/* TITLE */}

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">

                <Crown size={24} />

              </div>

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Premium
                </h2>

                <p className="text-gray-600">
                  Unlock the complete CareerAI
                  experience.
                </p>

              </div>

            </div>

            {/* PRICE */}

            <div className="mt-8">

              <span className="text-5xl font-bold text-gray-900">
                ₹499
              </span>

              <span className="ml-2 text-gray-500">
                /month
              </span>

            </div>

            {/* FEATURES */}

            <div className="mt-8 space-y-4">

              <Feature text="Unlimited Resume Analysis" />

              <Feature text="Advanced ATS Optimization" />

              <Feature text="Resume Improvement" />

              <Feature text="Job Resume Optimizer" />

              <Feature text="Unlimited Questions" />

              <Feature text="Expert Questions" />

              <Feature text="Unlimited Voice Interviews" />

              <Feature text="Advanced Interview Features" />

            </div>

            {/* UPGRADE BUTTON */}

            <button
              onClick={handleUpgrade}
              disabled={
                isPremium ||
                upgrading
              }
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {upgrading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Processing...
                </>
              ) : isPremium ? (
                <>
                  <Check size={18} />

                  Premium Active
                </>
              ) : (
                <>
                  <Crown size={18} />

                  Upgrade to Premium
                </>
              )}

            </button>

          </div>

        </div>

        {/* =================================================
            USAGE
        ================================================= */}

        {membership &&
          !isPremium && (
            <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6">

              <h3 className="text-lg font-semibold text-gray-900">
                Your current usage
              </h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <UsageItem
                  label="Resume Analysis"
                  value={`${membership.usage.resume_analysis_count}/3`}
                />

                <UsageItem
                  label="Voice Interviews"
                  value={`${membership.usage.voice_interview_count}/5`}
                />

                <UsageItem
                  label="Questions"
                  value={`${membership.usage.question_count}/500`}
                />

                <UsageItem
                  label="Interviews"
                  value={String(
                    membership.usage.interview_count
                  )}
                />

              </div>

            </div>
          )}

      </div>
    </main>
  );
}

/* =====================================================
   FEATURE
===================================================== */

function Feature({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">

        <Check
          size={14}
          className="text-green-600"
        />

      </div>

      <span className="text-sm text-gray-700">
        {text}
      </span>

    </div>
  );
}

/* =====================================================
   USAGE ITEM
===================================================== */

function UsageItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}