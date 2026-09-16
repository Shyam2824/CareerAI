"use client";

import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface ApiErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ApiError({
  message,
  onRetry,
  className = "",
}: ApiErrorProps) {
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50 p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          size={20}
          className="mt-0.5 shrink-0 text-red-600"
        />

        <div className="min-w-0 flex-1">
          <p className="font-medium text-red-800">
            Something went wrong
          </p>

          <p className="mt-1 text-sm text-red-700">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}