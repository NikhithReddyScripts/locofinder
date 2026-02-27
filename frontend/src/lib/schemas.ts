import { z } from "zod";

// ── LocationOut ────────────────────────────────────────────────────────────────
export const LocationOutSchema = z.object({
  location_id: z.string(),
  city: z.string(),
  county: z.string(),
  state: z.string(),
  median_income: z.number(),
  crime_index: z.number(),
  growth_index: z.number(),
  home_price: z.number(),
  rent_price: z.number(),
  population: z.number(),
  lat: z.number(),
  lon: z.number(),
});
export type LocationOut = z.infer<typeof LocationOutSchema>;

// ── Health ─────────────────────────────────────────────────────────────────────
export const HealthResponseSchema = z.object({
  status: z.string(),
  version: z.string(),
  uptime_seconds: z.number(),
  redis: z.enum(["connected", "disconnected"]),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// ── Scoring weights / filters ──────────────────────────────────────────────────
export const WeightsSchema = z.object({
  median_income: z.number().min(0).max(1),
  crime_index: z.number().min(0).max(1),
  growth_index: z.number().min(0).max(1),
  home_price: z.number().min(0).max(1),
  rent_price: z.number().min(0).max(1),
});
export type Weights = z.infer<typeof WeightsSchema>;

export const FiltersSchema = z.object({
  state: z.string().nullable(),
  max_home_price: z.number().nullable(),
  max_rent_price: z.number().nullable(),
  min_income: z.number().nullable(),
});
export type Filters = z.infer<typeof FiltersSchema>;

export const ScoringRequestSchema = z.object({
  weights: WeightsSchema,
  filters: FiltersSchema,
  limit: z.number().int().min(1).max(100),
});
export type ScoringRequest = z.infer<typeof ScoringRequestSchema>;

// ── Search (GET /locations/search) ────────────────────────────────────────────
export const SearchResponseSchema = z.object({
  total: z.number(),
  offset: z.number(),
  limit: z.number(),
  locations: z.array(LocationOutSchema),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// ── Recommend (POST /recommend) ───────────────────────────────────────────────
export const RecommendResultSchema = z.object({
  location: LocationOutSchema,
  total_score: z.number(),
});
export type RecommendResult = z.infer<typeof RecommendResultSchema>;

export const RecommendResponseSchema = z.object({
  total_analyzed: z.number(),
  results: z.array(RecommendResultSchema),
});
export type RecommendResponse = z.infer<typeof RecommendResponseSchema>;

// ── Scoring Schema (GET /scoring/schema) ──────────────────────────────────────
export const FeatureSchemaItemSchema = z.object({
  feature_name: z.string(),
  description: z.string(),
  min_value: z.number(),
  max_value: z.number(),
  optimization_direction: z.string(),
});
export type FeatureSchemaItem = z.infer<typeof FeatureSchemaItemSchema>;

export const ScoringSchemaResponseSchema = z.array(FeatureSchemaItemSchema);
export type ScoringSchemaResponse = z.infer<typeof ScoringSchemaResponseSchema>;

// ── Explain (POST /scoring/explain/{location_id}) ─────────────────────────────
export const FeatureDetailSchema = z.object({
  base_value: z.number(),
  normalized_value: z.number(),
  weight: z.number(),
  contribution: z.number(),
});
export type FeatureDetail = z.infer<typeof FeatureDetailSchema>;

export const ExplainResponseSchema = z.object({
  location_id: z.string(),
  total_score: z.number(),
  features: z.record(FeatureDetailSchema),
});
export type ExplainResponse = z.infer<typeof ExplainResponseSchema>;

// ── Admin (POST /admin/reset-dummy-data) ──────────────────────────────────────
export const AdminResetResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  rows_inserted: z.number().optional(),
}).passthrough();
export type AdminResetResponse = z.infer<typeof AdminResetResponseSchema>;
