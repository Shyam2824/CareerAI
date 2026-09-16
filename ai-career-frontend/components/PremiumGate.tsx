"use client";

import { useRouter } from "next/navigation";
import { Lock, Crown } from "lucide-react";

interface PremiumGateProps {
  title?: string;
  description?: string;
}

export default function PremiumGate({
  title = "Premium Feature",
  description = "Upgrade to Premium to unlock this feature.",
}: PremiumGateProps) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
        <Lock size={22} />
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-600">
        {description}
      </p>

      <button
        onClick={() => router.push("/pricing")}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
      >
        <Crown size={17} />
        Upgrade to Premium
      </button>
    </div>
  );
}