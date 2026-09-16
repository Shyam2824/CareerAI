"use client";

import { useState } from "react";
import {
  Users,
  Crown,
  CheckCircle,
} from "lucide-react";

type Plan = {
  name: string;
  price: string;
  users: number;
  features: string[];
};

export default function SubscriptionsPage() {
  const [plans] = useState<Plan[]>([
    {
      name: "Free",
      price: "₹0",
      users: 950,
      features: [
        "3 Resume Analyses",
        "5 Voice Interviews",
        "500 Basic Questions",
      ],
    },
    {
      name: "Premium",
      price: "₹499/month",
      users: 298,
      features: [
        "Unlimited Resume Analysis",
        "ATS Score Improvement",
        "Expert Level Questions",
        "Unlimited AI Interviews",
      ],
    },
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        Subscription Management
      </h1>

      <p className="mt-2 text-slate-500">
        Manage CareerAI membership plans.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-7 shadow-sm ${
              plan.name === "Premium"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {plan.name}
                </h2>

                <p className="mt-2 text-lg">
                  {plan.price}
                </p>
              </div>

              {plan.name === "Premium" ? (
                <Crown size={28} />
              ) : (
                <Users size={28} />
              )}
            </div>

            <p className="mt-6 font-semibold">
              {plan.users} Active Users
            </p>

            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`mt-8 w-full rounded-xl py-3 font-semibold ${
                plan.name === "Premium"
                  ? "bg-white text-purple-600"
                  : "bg-purple-600 text-white"
              }`}
            >
              Plan Active
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}