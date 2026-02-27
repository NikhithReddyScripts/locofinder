/**
 * Centralized API client for the Locofinder backend.
 *
 * All requests go through `apiFetch`. The `NEXT_PUBLIC_API_BASE_URL` env var
 * controls the backend base URL (defaults to http://localhost:8000).
 */

import { z } from "zod";
import type {
  ScoringRequest,
  SearchResponse,
  RecommendResponse,
  ScoringSchemaResponse,
  ExplainResponse,
  HealthResponse,
  AdminResetResponse,
} from "./schemas";
import {
  SearchResponseSchema,
  RecommendResponseSchema,
  ScoringSchemaResponseSchema,
  ExplainResponseSchema,
  HealthResponseSchema,
  AdminResetResponseSchema,
} from "./schemas";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Generic fetch wrapper ─────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  bypassCache = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (bypassCache) {
    headers["X-Bypass-Cache"] = "true";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body?.detail ?? body?.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

// ── Validated fetch — runs Zod parse after fetch ──────────────────────────────

async function apiFetchValidated<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestInit = {},
  bypassCache = false
): Promise<T> {
  const raw = await apiFetch<unknown>(path, options, bypassCache);
  return schema.parse(raw);
}

// ── Endpoint functions ────────────────────────────────────────────────────────

/** GET /health */
export async function getHealth(): Promise<HealthResponse> {
  return apiFetchValidated("/health", HealthResponseSchema);
}

/** GET /locations/search */
export interface SearchParams {
  state?: string;
  offset?: number;
  limit?: number;
}
export async function getLocations(
  params: SearchParams = {},
  bypassCache = false
): Promise<SearchResponse> {
  const qs = new URLSearchParams();
  if (params.state) qs.set("state", params.state);
  if (params.offset != null) qs.set("offset", String(params.offset));
  if (params.limit != null) qs.set("limit", String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetchValidated(`/locations/search${query}`, SearchResponseSchema, {}, bypassCache);
}

/** POST /recommend */
export async function postRecommend(
  body: ScoringRequest,
  bypassCache = false
): Promise<RecommendResponse> {
  return apiFetchValidated(
    "/recommend",
    RecommendResponseSchema,
    { method: "POST", body: JSON.stringify(body) },
    bypassCache
  );
}

/** GET /scoring/schema */
export async function getScoringSchema(): Promise<ScoringSchemaResponse> {
  return apiFetchValidated("/scoring/schema", ScoringSchemaResponseSchema);
}

/** POST /scoring/explain/{location_id} */
export async function postExplain(
  locationId: string,
  body: ScoringRequest,
  bypassCache = false
): Promise<ExplainResponse> {
  return apiFetchValidated(
    `/scoring/explain/${encodeURIComponent(locationId)}`,
    ExplainResponseSchema,
    { method: "POST", body: JSON.stringify(body) },
    bypassCache
  );
}

/** POST /admin/reset-dummy-data?rows= */
export async function postAdminReset(rows = 10000): Promise<AdminResetResponse> {
  return apiFetchValidated(
    `/admin/reset-dummy-data?rows=${rows}`,
    AdminResetResponseSchema,
    { method: "POST" }
  );
}
