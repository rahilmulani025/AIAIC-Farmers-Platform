import { z } from "zod";

export const SERVICES = ["market", "water", "weather", "crop", "storage"] as const;
export type Service = (typeof SERVICES)[number];

export const isService = (v: string): v is Service => (SERVICES as readonly string[]).includes(v);

/**
 * Loose schema on purpose: the AIAIC engine is evolving and every field may be
 * absent. Missing fields must degrade to "not provided by the service" in the
 * UI rather than crash it.
 */
export const sourceSchema = z.object({
  source_id: z.string().optional(),
  source_name: z.string().optional(),
  signal: z.string().optional(),
  tier: z.string().optional(),
  observed_at: z.string().optional(),
  freshness: z.string().optional(),
  license: z.string().optional(),
  synthetic: z.boolean().optional(),
  source_url: z.string().optional(),
});

export const intelligenceItemSchema = z.object({
  recommendation: z.string().optional(),
  confidence: z.string().optional(),
  recommendation_detail: z.string().optional(),
  abstained: z.boolean().optional(),
  subject: z.object({ crop: z.string().optional(), region: z.string().optional() }).optional(),
  explainability: z.array(z.string()).optional(),
  known_unknowns: z.array(z.string()).optional(),
  supporting_evidence: z
    .object({
      decision_id: z.string().optional(),
      confidence_score: z.number().optional(),
    })
    .optional(),
  sources_used: z.array(sourceSchema).optional(),
  calibrated: z.boolean().optional(),
  decision_id: z.string().optional(),
});

export type Source = z.infer<typeof sourceSchema>;
export type IntelligenceItem = z.infer<typeof intelligenceItemSchema>;

/**
 * `GET /catalog` — the engine's own list of valid inputs. Every field is
 * optional and defaults to an empty list so a changed payload degrades to the
 * built-in fallback lists instead of an error.
 */
export const catalogSchema = z.object({
  services: z.array(z.string()).default([]),
  crops: z.array(z.string()).default([]),
  regions: z.array(z.string()).default([]),
  market_mandis: z.array(z.string()).default([]),
  // Counts per service, e.g. { market: { crops: 90 } }.
  per_service: z.record(z.string(), z.record(z.string(), z.number())).optional(),
  uncalibrated: z.boolean().optional(),
});

export type Catalog = z.infer<typeof catalogSchema>;

export type CatalogResult =
  | { ok: true; catalog: Catalog; baseUrlConfigured: boolean; cached: boolean }
  | {
      ok: false;
      reason: FailureReason;
      status?: number | undefined;
      detail?: string | undefined;
      baseUrlConfigured: boolean;
    };

export type FailureReason =
  | "offline" // tunnel / backend not reachable
  | "not_found" // endpoint or region/crop unsupported
  | "bad_response" // reached the service but it did not return usable JSON
  | "request_failed"; // anything else

export type ServiceResult =
  | { ok: true; service: Service; items: IntelligenceItem[]; fetchedAt: string }
  | {
      ok: false;
      service: Service;
      reason: FailureReason;
      status?: number | undefined;
      detail?: string | undefined;
      fetchedAt: string;
    };

export type ConfidenceLevel = "high" | "medium" | "low" | "unknown";

export function confidenceLevel(item: IntelligenceItem): ConfidenceLevel {
  const raw = (item.confidence ?? "").toLowerCase();
  if (raw.includes("high")) return "high";
  if (raw.includes("med") || raw.includes("moderate")) return "medium";
  if (raw.includes("low") || raw.includes("very")) return "low";
  const score = item.supporting_evidence?.confidence_score;
  if (typeof score === "number") {
    if (score >= 0.66) return "high";
    if (score >= 0.33) return "medium";
    return "low";
  }
  return "unknown";
}

export function isAbstention(item: IntelligenceItem): boolean {
  return item.abstained === true || (item.recommendation ?? "").toUpperCase() === "ABSTAIN";
}

/** Freshest observation date across sources, if any source reports one. */
export function observedAt(item: IntelligenceItem): string | null {
  const dates = (item.sources_used ?? [])
    .map((s) => s.observed_at)
    .filter((d): d is string => typeof d === "string" && d.length > 0)
    .sort();
  return dates.length ? dates[dates.length - 1]! : null;
}

export function daysOld(iso: string): number | null {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}
