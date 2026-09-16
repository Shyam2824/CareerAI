export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success?: boolean;

  error?: {
    code?: string;
    message?: string;
    fields?: ApiFieldError[];
  };

  detail?: unknown;
}

export function getApiErrorMessage(
  error: unknown
): string {
  const e = error as {
    response?: {
      status?: number;
      data?: ApiErrorResponse;
    };
    message?: string;
  };

  const status = e?.response?.status;
  const data = e?.response?.data;

  // New backend error format
  if (data?.error?.message) {
    return data.error.message;
  }

  // Old FastAPI validation format
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => {
        const value = item as {
          msg?: unknown;
        };

        return String(
          value?.msg ?? "Validation error"
        );
      })
      .join(", ");
  }

  // Old FastAPI HTTP error format
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  switch (status) {
    case 400:
      return "Invalid request.";

    case 401:
      return "Your session has expired. Please login again.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested resource was not found.";

    case 409:
      return "This operation conflicts with existing data.";

    case 413:
      return "The uploaded file is too large.";

    case 422:
      return "Please check the information you entered.";

    case 429:
      return "Too many requests. Please try again later.";

    case 500:
      return "Server error. Please try again later.";

    case 502:
    case 503:
    case 504:
      return "Service temporarily unavailable.";
  }

  if (e?.message === "Network Error") {
    return (
      "Unable to connect to the server. " +
      "Please check that the backend is running."
    );
  }

  if (
    e?.message
      ?.toLowerCase()
      .includes("timeout")
  ) {
    return "The request took too long. Please try again.";
  }

  return (
    e?.message ||
    "Something went wrong. Please try again."
  );
}

export function getApiFieldErrors(
  error: unknown
): ApiFieldError[] {
  const e = error as {
    response?: {
      data?: ApiErrorResponse;
    };
  };

  return (
    e?.response?.data?.error?.fields || []
  );
}