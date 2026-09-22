import type { ApiError, ApiResponse } from "@gabay/types";
export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}
let refreshPromise: Promise<Response> | null = null;
async function request<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "X-Gabay-Client": "web",
        ...(init.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiClientError(
      "Could not connect to GABAY. Please check your connection and try again.",
      0,
      "NETWORK_ERROR",
    );
  }
  if (response.status === 401 && retry && !path.startsWith("/auth/")) {
    refreshPromise ??= fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: { "X-Gabay-Client": "web" },
    }).finally(() => {
      refreshPromise = null;
    });
    const refreshed = await refreshPromise;
    if (refreshed.ok) return request<T>(path, init, false);
  }
  let body: ApiResponse<T> | ApiError;
  try {
    body = await response.json();
  } catch {
    throw new ApiClientError(
      "The application server is unavailable. Please try again shortly.",
      response.status,
      "SERVER_UNAVAILABLE",
    );
  }
  if (!response.ok || "error" in body) {
    const error =
      "error" in body
        ? body.error
        : {
            message: "The request could not be completed.",
            code: "REQUEST_FAILED",
          };
    throw new ApiClientError(error.message, response.status, error.code);
  }
  return body.data;
}
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
export async function downloadFile(path: string, filename: string) {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "X-Gabay-Client": "web" },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(
      body?.error?.message ?? "The file could not be downloaded.",
    );
  }
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
