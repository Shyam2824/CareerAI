"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Crown,
  Loader2,
  XCircle,
} from "lucide-react";

import  api  from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface Subscription {
  id: number;
  plan_name: string;
  price: number;
  status: string;
  start_date: string;
  end_date: string | null;
}

interface Payment {
  id: number;
  amount: number;
  currency: string;
  payment_method: string | null;
  transaction_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: string;
  created_at: string;
}

interface BillingData {
  subscription: Subscription;
  payments: Payment[];
  is_premium: boolean;
  days_remaining: number;
}

export default function BillingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const loadBilling = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<BillingData>("/billing/me");

      setBilling(response.data);
    } catch (err) {
      console.error("Billing load failed:", err);
      setError("Unable to load billing information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login?redirect=/billing");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBilling();
  }, [user, authLoading, router]);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your Premium membership?"
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      setError("");

      await api.post("/billing/cancel");

      await loadBilling();

      alert("Subscription cancelled successfully.");
    } catch (err) {
      console.error("Cancellation failed:", err);
      setError("Unable to cancel subscription.");
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold">
              Billing & Subscription
            </h1>

            <p className="text-slate-400 mt-2">
              Manage your CareerAI membership and payment history.
            </p>
          </div>

          <button
            onClick={() => router.push("/pricing")}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
          >
            View Plans
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {billing && (
          <>
            {/* Current Plan */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-600/20 flex items-center justify-center">
                    {billing.is_premium ? (
                      <Crown className="text-yellow-400" size={28} />
                    ) : (
                      <CheckCircle className="text-green-400" size={28} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">
                      Current Plan
                    </p>

                    <h2 className="text-2xl font-bold capitalize">
                      {billing.subscription.plan_name}
                    </h2>
                  </div>
                </div>

                                <div className="text-left md:text-right">
                  <p className="text-sm text-slate-400">
                    Status
                  </p>

                  <span
                    className={`inline-flex mt-1 px-3 py-1 rounded-full text-sm ${
                      billing.subscription.status === "active"
                        ? "bg-green-500/10 text-green-400"
                        : billing.subscription.status === "expired"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {billing.subscription.status}
                  </span>
                </div>
              </div>

              {/* Expired Membership Message */}
              {billing.subscription.status === "expired" && (
                <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <p className="font-semibold text-yellow-300">
                    Your Premium membership has expired.
                  </p>

                  <p className="text-sm text-yellow-200/70 mt-1">
                    You are currently using the Free plan.
                    Upgrade again to restore Premium features.
                  </p>

                  <button
                    onClick={() => router.push("/pricing")}
                    className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
                  >
                    Upgrade to Premium
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4 mt-8">

                <div className="rounded-xl bg-slate-800/60 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <CreditCard size={16} />
                    Price
                  </div>

                  <p className="text-xl font-semibold mt-2">
                    ₹{billing.subscription.price}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-800/60 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar size={16} />
                    Start Date
                  </div>

                  <p className="text-lg font-semibold mt-2">
                    {new Date(
                      billing.subscription.start_date
                    ).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-800/60 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar size={16} />
                    Expiry
                  </div>

                  <p className="text-lg font-semibold mt-2">
                    {billing.subscription.end_date
                      ? new Date(
                          billing.subscription.end_date
                        ).toLocaleDateString("en-IN")
                      : "No expiry"}
                  </p>

                  {billing.is_premium && (
                    <p className="text-sm text-blue-400 mt-1">
                      {billing.days_remaining} days remaining
                    </p>
                  )}
                </div>
              </div>

              {billing.is_premium && (
                <div className="mt-6">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {cancelling ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <XCircle size={17} />
                    )}

                    Cancel Membership
                  </button>
                </div>
              )}
            </section>

            {/* Payment History */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">

              <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-semibold">
                  Payment History
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Your CareerAI payment transactions.
                </p>
              </div>

              {billing.payments.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  No payment history available.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-slate-400 border-b border-slate-800">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Method</th>
                        <th className="px-6 py-4">Payment ID</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {billing.payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-slate-800 last:border-0"
                        >
                          <td className="px-6 py-4 text-sm">
                            {new Date(
                              payment.created_at
                            ).toLocaleDateString("en-IN")}
                          </td>

                          <td className="px-6 py-4 font-medium">
                            ₹{payment.amount}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-300">
                            {payment.payment_method || "—"}
                          </td>

                          <td className="px-6 py-4 text-xs text-slate-400">
                            {payment.razorpay_payment_id ||
                              payment.transaction_id ||
                              "—"}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                payment.status === "paid"
                                  ? "bg-green-500/10 text-green-400"
                                  : payment.status === "failed"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-yellow-500/10 text-yellow-400"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}