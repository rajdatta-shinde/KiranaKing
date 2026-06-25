/**
 * Thin REST client for the KiranaKing API.
 *
 * - Sends the auth cookie (credentials: "include") and, as a fallback, a
 *   Bearer token persisted in localStorage so auth survives blocked cookies.
 * - Normalises responses so Prisma's `id` is also exposed as `_id`, which is
 *   what every frontend type/component expects.
 */

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const TOKEN_KEY = "kk_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Recursively expose Prisma `id` as `_id` so existing components keep working. */
function normalize<T>(data: T): T {
  if (Array.isArray(data)) return data.map((item) => normalize(item)) as unknown as T;
  if (data && typeof data === "object") {
    const source = data as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(source)) out[key] = normalize(source[key]);
    if (out.id !== undefined && out._id === undefined) out._id = out.id;
    return out as unknown as T;
  }
  return data;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** When true, send `body` as-is (FormData) without JSON serialisation. */
  form?: boolean;
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, form = false } = options;
  const headers: Record<string, string> = {};

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (form) {
    payload = body as FormData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: payload,
      credentials: "include",
    });
  } catch {
    throw new ApiError("Network error — is the server running?", 0);
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText || "Request failed";
    throw new ApiError(message, res.status);
  }

  return normalize(data) as T;
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T = unknown>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T = unknown>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  del: <T = unknown>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T = unknown>(path: string, body: FormData) =>
    request<T>(path, { method: "POST", body, form: true }),
  putForm: <T = unknown>(path: string, body: FormData) =>
    request<T>(path, { method: "PUT", body, form: true }),
};
